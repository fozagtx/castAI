import type { DocumentData } from "flexsearch";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { Document } from "flexsearch";
import { z } from "zod";

import { source } from "@/lib/source";

import type { ChatUIMessage, SearchTool } from "../../../components/ai/search";

interface CustomDocument extends DocumentData {
  url: string;
  title: string;
  description: string;
  content: string;
}

const searchServer = createSearchServer();

async function createSearchServer() {
  const search = new Document<CustomDocument>({
    document: {
      id: "url",
      index: ["title", "description", "content"],
      store: true,
    },
  });

  const docs = await chunkedAll(
    source.getPages().map(async (page) => {
      if (!("getText" in page.data)) return null;

      return {
        title: page.data.title,
        description: page.data.description ?? "",
        url: page.url,
        content: await page.data.getText("processed"),
      } as CustomDocument;
    })
  );

  for (const doc of docs) {
    if (doc) search.add(doc);
  }

  return search;
}

async function chunkedAll<O>(promises: Promise<O>[]): Promise<O[]> {
  const size = 50;
  const out: O[] = [];

  for (let i = 0; i < promises.length; i += size) {
    out.push(...(await Promise.all(promises.slice(i, i + size))));
  }

  return out;
}

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  appName: "castAI docs",
  appUrl:
    process.env.CASTAI_DOCS_SITE_URL ?? "https://github.com/fozagtx/castAI",
});

const defaultModelPool = [
  "openrouter/owl-alpha",
  "openrouter/free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "poolside/laguna-m.1:free",
  "nex-agi/nex-n2-pro:free",
  "openai/gpt-oss-120b:free",
  "google/gemma-4-31b-it:free",
  "poolside/laguna-xs.2:free",
  "openai/gpt-oss-20b:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
] as const;

const maxOpenRouterFallbackModels = 3;

function getModelPool() {
  const configured = process.env.CASTAI_DOCS_AI_MODELS?.split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  return configured?.length ? configured : [...defaultModelPool];
}

const systemPrompt = [
  "You answer questions about the castAI documentation.",
  "Use the search tool before answering unless the answer is already present in the conversation.",
  "Ground answers in returned docs. Cite source pages with markdown links using the url field.",
  "Keep answers brief, practical, and implementation-focused.",
  "Do not mention the underlying model, provider routing, fallback list, or infrastructure.",
  "If the docs do not contain the answer, say that the docs do not contain it and suggest the closest relevant page or query.",
].join("\n");

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json(
      { error: "Docs AI is not configured." },
      { status: 503 }
    );
  }

  const reqJson = await req.json();
  const messages = normalizeMessages(reqJson.messages);
  const [primaryModel, ...configuredFallbackModels] = getModelPool();
  const fallbackModels = configuredFallbackModels.slice(
    0,
    maxOpenRouterFallbackModels
  );

  const result = streamText({
    model: openrouter.chat(primaryModel, {
      models: fallbackModels,
      provider: {
        allow_fallbacks: true,
        require_parameters: true,
      },
    }),
    maxRetries: 0,
    stopWhen: stepCountIs(5),
    temperature: 0.2,
    toolChoice: "auto",
    system: systemPrompt,
    tools: {
      search: searchTool,
    },
    messages: await convertToModelMessages<ChatUIMessage>(messages, {
      convertDataPart(part) {
        if (part.type === "data-client") {
          return {
            type: "text",
            text: `[Client Context: ${JSON.stringify(part.data)}]`,
          };
        }
      },
    }),
  });

  return result.toUIMessageStreamResponse<ChatUIMessage>({
    originalMessages: messages,
    sendReasoning: false,
    onError(error) {
      console.error("Docs AI chat failed", error);
      return "Docs AI is temporarily unavailable. Try again.";
    },
  });
}

function normalizeMessages(input: unknown): ChatUIMessage[] {
  if (!Array.isArray(input)) return [];

  return input.flatMap((message, index) => {
    if (!isRecord(message)) return [];

    const role = normalizeRole(message.role);
    const id = typeof message.id === "string" ? message.id : `msg-${index}`;

    if (Array.isArray(message.parts)) {
      return [{ ...message, id, role } as ChatUIMessage];
    }

    const text = contentToText(message.content).trim();
    if (!text) return [];

    return [
      {
        id,
        role,
        parts: [{ type: "text", text }],
      } as ChatUIMessage,
    ];
  });
}

function normalizeRole(role: unknown): ChatUIMessage["role"] {
  return role === "assistant" || role === "system" || role === "user"
    ? role
    : "user";
}

function contentToText(content: unknown): string {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (isRecord(part) && typeof part.text === "string") return part.text;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const searchTool = tool({
  description: "Search the castAI docs and return the most relevant pages.",
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(8).default(5),
  }),
  async execute({ query, limit }) {
    const search = await searchServer;
    const results = (await search.searchAsync(query, {
      limit,
      merge: true,
      enrich: true,
    })) as Array<{ result?: Array<{ doc?: CustomDocument }> }>;

    return results
      .flatMap((group) => group.result ?? [])
      .map((item) => item.doc)
      .filter((doc): doc is CustomDocument => Boolean(doc))
      .map((doc) => ({
        title: doc.title,
        description: doc.description,
        url: doc.url,
        content: excerpt(doc.content, query),
      }))
      .slice(0, limit);
  },
}) satisfies SearchTool;

function excerpt(content: string, query: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= 1600) return normalized;

  const term = query
    .toLowerCase()
    .split(/\s+/)
    .find((word) => word.length > 3);
  const index = term ? normalized.toLowerCase().indexOf(term) : -1;
  const start = Math.max(index - 300, 0);
  const end = Math.min(start + 1600, normalized.length);

  return `${start > 0 ? "..." : ""}${normalized.slice(start, end)}${
    end < normalized.length ? "..." : ""
  }`;
}
