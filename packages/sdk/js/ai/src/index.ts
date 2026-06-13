import type {
  CallSettings,
  GenerateTextResult,
  LanguageModel,
  Prompt,
  StopCondition,
} from "ai";
import { x402Client } from "@x402/core/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import { generateText, stepCountIs, tool } from "ai";
import { Mppx } from "mppx/client";
import { z } from "zod";

import type { casper as mppCasper } from "@castai/mpp/client";
import type { CasperSignerOptions } from "@castai/x402/client";
import { casper } from "@castai/mpp/client";
import { registerExactCasperClientScheme } from "@castai/x402/client";

export type PaymentScheme = "x402" | "mpp";

export type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>;

export type AgentResourceRequest = {
  body?: string | undefined;
  headers?: Record<string, string> | undefined;
  method?: string | undefined;
  url: string;
};

export type AgentResourceResponse = {
  body: unknown;
  contentType: string | null;
  headers: Record<string, string>;
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
};

export type CreateX402FetchOptions = CasperSignerOptions & {
  fetch?: FetchLike | undefined;
  networks?: ("casper:mainnet" | "casper:testnet")[] | undefined;
};

export type CreateMppFetchOptions = mppCasper.Parameters & {
  fetch?: FetchLike | undefined;
};

export type CreateCastaiAgentToolsOptions = {
  mpp?: {
    fetch?: FetchLike | undefined;
  };
  x402?: {
    fetch?: FetchLike | undefined;
  };
};

export type CastaiAgentFetchOptions = {
  mpp?: CreateMppFetchOptions | undefined;
  x402?: CreateX402FetchOptions | undefined;
};

export type CastaiAgentFetches = {
  mpp?: FetchLike | undefined;
  x402?: FetchLike | undefined;
};

export type CastaiAgentTools = ReturnType<typeof createCastaiAgentTools>;

export type CastaiAgent = {
  fetches: CastaiAgentFetches;
  system: string;
  tools: CastaiAgentTools;
};

export type GenerateCastaiTextOptions = CallSettings &
  Prompt & {
    model: LanguageModel;
    mpp?: CreateMppFetchOptions | undefined;
    stopWhen?:
      | StopCondition<CastaiAgentTools>
      | Array<StopCondition<CastaiAgentTools>>
      | undefined;
    tools?: CastaiAgentTools | undefined;
    x402?: CreateX402FetchOptions | undefined;
  };

export type LlmTextOptions = {
  includeHeaders?: boolean | undefined;
  maxBodyCharacters?: number | undefined;
};

export const DEFAULT_CASTAI_AGENT_SYSTEM =
  "You can use castAI tools to fetch paid HTTP resources through real Casper CSPR x402 or MPP payment flows. Do not invent payment success, transaction hashes, deploy hashes, signatures, or protected resource content. If a configured payment tool fails, report the failure from the tool result.";

export const castaiResourceRequestSchema = z.object({
  body: z.string().optional().describe("Optional raw request body."),
  headers: z
    .record(z.string(), z.string())
    .optional()
    .describe("Optional request headers."),
  method: z
    .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
    .optional()
    .describe("HTTP method. Defaults to GET."),
  url: z.url().describe("HTTP resource URL to request."),
});

export function createCasperX402Fetch(
  options: CreateX402FetchOptions
): FetchLike {
  const client = new x402Client();

  registerExactCasperClientScheme(client, {
    ...options,
    networks: options.networks ?? ["casper:testnet"],
  });

  return wrapFetchWithPayment(options.fetch ?? fetch, client) as FetchLike;
}

export function createCasperMppFetch(
  options: CreateMppFetchOptions
): FetchLike {
  const client = Mppx.create({
    methods: [casper(options)],
  });

  return client.fetch.bind(client) as FetchLike;
}

export function createCastaiAgentFetches(
  options: CastaiAgentFetchOptions
): CastaiAgentFetches {
  return {
    mpp: options.mpp ? createCasperMppFetch(options.mpp) : undefined,
    x402: options.x402 ? createCasperX402Fetch(options.x402) : undefined,
  };
}

export function createCastaiAgent(
  options: CastaiAgentFetchOptions
): CastaiAgent {
  const fetches = createCastaiAgentFetches(options);

  return {
    fetches,
    system: DEFAULT_CASTAI_AGENT_SYSTEM,
    tools: createCastaiAgentTools({
      mpp: { fetch: fetches.mpp },
      x402: { fetch: fetches.x402 },
    }),
  };
}

export function createCastaiAgentTools(options: CreateCastaiAgentToolsOptions) {
  return {
    payX402Resource: tool({
      description:
        "Request an HTTP x402 resource and pay with configured Casper CSPR payment credentials.",
      inputSchema: castaiResourceRequestSchema,
      execute: async (request) => {
        if (!options.x402?.fetch) {
          throw new Error("x402 fetch is not configured for this agent.");
        }

        return fetchResource(options.x402.fetch, request);
      },
    }),

    payMppResource: tool({
      description:
        "Request an MPP-protected HTTP resource and pay with configured Casper CSPR payment credentials.",
      inputSchema: castaiResourceRequestSchema,
      execute: async (request) => {
        if (!options.mpp?.fetch) {
          throw new Error("MPP fetch is not configured for this agent.");
        }

        return fetchResource(options.mpp.fetch, request);
      },
    }),
  };
}

export async function generateCastaiText(
  options: GenerateCastaiTextOptions
): Promise<GenerateTextResult<CastaiAgentTools, never>> {
  const { mpp, stopWhen, system, tools, x402, ...generateOptions } = options;
  const agent = tools
    ? { system: DEFAULT_CASTAI_AGENT_SYSTEM, tools }
    : createCastaiAgent({ mpp, x402 });

  return generateText<CastaiAgentTools>({
    ...(generateOptions as CallSettings & Prompt & { model: LanguageModel }),
    stopWhen: stopWhen ?? stepCountIs(5),
    system: [agent.system, system].filter(Boolean).join("\n\n"),
    tools: agent.tools,
  });
}

export async function fetchResource(
  paymentFetch: FetchLike,
  request: AgentResourceRequest
): Promise<AgentResourceResponse> {
  const response = await paymentFetch(request.url, {
    body: request.body,
    headers: request.headers,
    method: request.method ?? "GET",
  });

  return readResponse(response, request.url);
}

export async function getPaidResourceText(
  paymentFetch: FetchLike,
  request: AgentResourceRequest,
  options?: LlmTextOptions | undefined
): Promise<string> {
  return paidResourceResponseToText(
    await fetchResource(paymentFetch, request),
    options
  );
}

export function paidResourceResponseToText(
  response: AgentResourceResponse,
  options: LlmTextOptions = {}
): string {
  const maxBodyCharacters = options.maxBodyCharacters ?? 12_000;
  const body =
    typeof response.body === "string"
      ? response.body
      : JSON.stringify(response.body, null, 2);
  const clippedBody =
    body.length > maxBodyCharacters
      ? `${body.slice(0, maxBodyCharacters)}\n[truncated]`
      : body;
  const lines = [
    `URL: ${response.url}`,
    `Status: ${response.status} ${response.statusText}`.trim(),
    `OK: ${response.ok}`,
    response.contentType ? `Content-Type: ${response.contentType}` : undefined,
  ];

  if (options.includeHeaders) {
    lines.push(`Headers: ${JSON.stringify(response.headers, null, 2)}`);
  }

  lines.push("", "Body:", clippedBody || "null");

  return lines.filter((line) => line !== undefined).join("\n");
}

export const llm = {
  text: paidResourceResponseToText,
} as const;

async function readResponse(
  response: Response,
  fallbackUrl: string
): Promise<AgentResourceResponse> {
  const contentType = response.headers.get("content-type");
  const bodyText = await response.text();

  return {
    body: parseBody(bodyText, contentType),
    contentType,
    headers: Object.fromEntries(response.headers.entries()),
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    url: response.url || fallbackUrl,
  };
}

function parseBody(body: string, contentType: string | null): unknown {
  if (!body) return null;
  if (!contentType?.includes("application/json")) return body;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}
