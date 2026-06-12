import { describe, expect, it, vi } from "vitest";

import type { AgentResourceRequest, AgentResourceResponse } from "./index.js";
import { createCastaiAgentTools, fetchResource } from "./index.js";

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
});
