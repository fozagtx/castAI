import { describe, expect, it, vi } from "vitest";

import type { AgentResourceRequest, AgentResourceResponse } from "./index.js";
import { createCastaiAgentKitActionProvider } from "./adapters/agentkit.js";
import { createCastaiGoatPlugin } from "./adapters/goat.js";
import { createCastaiLangChainTools } from "./adapters/langchain.js";
import { createCastaiOpenAITools } from "./adapters/openai.js";
import {
  castaiResourceRequestSchema,
  createCastaiAgent,
  createCastaiAgentTools,
  fetchResource,
  getPaidResourceText,
  llm,
  paidResourceResponseToText,
} from "./index.js";

type ExecutableTool = {
  execute(request: AgentResourceRequest): Promise<AgentResourceResponse>;
};

describe("castAI AI SDK tools", () => {
  it("forwards resource requests and parses JSON responses", async () => {
    const paymentFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ paid: true }), {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    );

    const response = await fetchResource(paymentFetch, {
      body: JSON.stringify({ query: "gold" }),
      headers: { authorization: "Bearer test" },
      method: "POST",
      url: "https://api.castai.test/protected",
    });

    expect(paymentFetch).toHaveBeenCalledWith(
      "https://api.castai.test/protected",
      {
        body: JSON.stringify({ query: "gold" }),
        headers: { authorization: "Bearer test" },
        method: "POST",
      }
    );
    expect(response).toMatchObject({
      body: { paid: true },
      contentType: "application/json",
      ok: true,
      status: 200,
      url: "https://api.castai.test/protected",
    });
  });

  it("validates resource requests before calling payment fetchers", async () => {
    const paymentFetch = vi.fn();

    await expect(
      fetchResource(paymentFetch, {
        method: "TRACE",
        url: "not-a-url",
      })
    ).rejects.toThrow();
    expect(paymentFetch).not.toHaveBeenCalled();
  });

  it("parses structured JSON response content types", async () => {
    const paymentFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "payment-required" }), {
        headers: { "content-type": "application/problem+json" },
        status: 402,
        statusText: "Payment Required",
      })
    );

    const response = await fetchResource(paymentFetch, {
      url: "https://api.castai.test/problem",
    });

    expect(response.body).toEqual({ error: "payment-required" });
    expect(response.ok).toBe(false);
  });

  it("can throw typed errors for non-ok resource responses", async () => {
    const paymentFetch = vi.fn().mockResolvedValue(
      new Response("payment required", {
        status: 402,
        statusText: "Payment Required",
      })
    );

    await expect(
      fetchResource(
        paymentFetch,
        {
          url: "https://api.castai.test/protected",
        },
        { throwOnError: true }
      )
    ).rejects.toMatchObject({
      name: "CastaiResourceError",
      response: {
        body: "payment required",
        status: 402,
        url: "https://api.castai.test/protected",
      },
    });
  });

  it("passes abort signals and timeout signals to payment fetchers", async () => {
    vi.useFakeTimers();
    const paymentFetch = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(init.signal?.reason);
          });
        });
      }
    );

    const pending = fetchResource(
      paymentFetch,
      {
        url: "https://api.castai.test/slow",
      },
      { timeoutMs: 25 }
    );
    const pendingExpectation = expect(pending).rejects.toThrow(
      "castAI resource request timed out after 25ms"
    );

    await vi.advanceTimersByTimeAsync(25);
    await pendingExpectation;
    expect(paymentFetch).toHaveBeenCalledWith(
      "https://api.castai.test/slow",
      expect.objectContaining({
        method: "GET",
        signal: expect.any(AbortSignal),
      })
    );
    vi.useRealTimers();
  });

  it("exposes x402 and MPP executable tools", async () => {
    const x402Fetch = vi.fn().mockResolvedValue(new Response("x402-ok"));
    const mppFetch = vi.fn().mockResolvedValue(new Response("mpp-ok"));
    const tools = createCastaiAgentTools({
      mpp: { fetch: mppFetch },
      x402: { fetch: x402Fetch },
    });

    const x402Result = await (
      tools.payX402Resource as unknown as ExecutableTool
    ).execute({
      url: "https://api.castai.test/x402",
    });
    const mppResult = await (
      tools.payMppResource as unknown as ExecutableTool
    ).execute({
      url: "https://api.castai.test/mpp",
    });

    expect(x402Fetch).toHaveBeenCalledWith("https://api.castai.test/x402", {
      body: undefined,
      headers: undefined,
      method: "GET",
    });
    expect(mppFetch).toHaveBeenCalledWith("https://api.castai.test/mpp", {
      body: undefined,
      headers: undefined,
      method: "GET",
    });
    expect(x402Result.body).toBe("x402-ok");
    expect(mppResult.body).toBe("mpp-ok");
  });

  it("fails tool execution when a payment fetcher is missing", async () => {
    const tools = createCastaiAgentTools({});

    await expect(
      (tools.payX402Resource as unknown as ExecutableTool).execute({
        url: "https://api.castai.test/x402",
      })
    ).rejects.toThrow("x402 fetch is not configured for this agent.");

    await expect(
      (tools.payMppResource as unknown as ExecutableTool).execute({
        url: "https://api.castai.test/mpp",
      })
    ).rejects.toThrow("MPP fetch is not configured for this agent.");
  });

  it("creates an agent shell with configured tools and system instructions", async () => {
    const agent = createCastaiAgent({});

    expect(agent.system).toContain("real Casper CSPR x402 or MPP");
    expect(agent.fetches).toEqual({ mpp: undefined, x402: undefined });
    expect(Object.keys(agent.tools)).toEqual([
      "payX402Resource",
      "payMppResource",
    ]);
  });

  it("formats paid resource responses as LLM text", async () => {
    const text = paidResourceResponseToText(
      {
        body: { answer: 42 },
        contentType: "application/json",
        headers: { "x-castai": "paid" },
        ok: true,
        status: 200,
        statusText: "OK",
        url: "https://api.castai.test/data",
      },
      { includeHeaders: true }
    );

    expect(text).toContain("URL: https://api.castai.test/data");
    expect(text).toContain("Status: 200 OK");
    expect(text).toContain('"x-castai": "paid"');
    expect(text).toContain('"answer": 42');
    expect(llm.text).toBe(paidResourceResponseToText);
    expect(castaiResourceRequestSchema.parse({ url: responseUrl() })).toEqual({
      url: responseUrl(),
    });
  });

  it("fetches a paid resource and returns clipped LLM text", async () => {
    const paymentFetch = vi
      .fn()
      .mockResolvedValue(new Response("abcdefghijklmnopqrstuvwxyz"));

    const text = await getPaidResourceText(
      paymentFetch,
      {
        url: "https://api.castai.test/text",
      },
      { maxBodyCharacters: 5 }
    );

    expect(text).toContain("Body:\nabcde\n[truncated]");
  });

  it("exposes dependency-light adapter surfaces", async () => {
    const x402Fetch = vi
      .fn()
      .mockImplementation(() => Promise.resolve(new Response("adapter-ok")));
    const options = {
      x402: { fetch: x402Fetch },
    };

    const openai = createCastaiOpenAITools(options);
    expect(openai.tools[0]).toMatchObject({
      name: "payX402Resource",
      type: "function",
    });
    await expect(
      openai.executeToolCallText({
        function: {
          arguments: JSON.stringify({ url: responseUrl() }),
          name: "payX402Resource",
        },
      })
    ).resolves.toContain("adapter-ok");

    const langchain = createCastaiLangChainTools(options);
    await expect(langchain[0]?.func({ url: responseUrl() })).resolves.toContain(
      "adapter-ok"
    );

    const agentkit = createCastaiAgentKitActionProvider(options);
    await expect(
      agentkit.getActions()[0]?.invoke(undefined, { url: responseUrl() })
    ).resolves.toContain("adapter-ok");

    const goat = createCastaiGoatPlugin(options);
    await expect(
      goat.getTools()[0]?.execute({ url: responseUrl() })
    ).resolves.toContain("adapter-ok");
  });
});

function responseUrl() {
  return "https://api.castai.test/resource";
}
