import { describe, expect, it } from "vitest";

import {
  createCastaiMcpDoctor,
  createCastaiMcpFetchesFromEnv,
} from "./index.js";

describe("castAI MCP configuration", () => {
  it("reports missing signer configuration", () => {
    expect(createCastaiMcpFetchesFromEnv({})).toEqual({});
    expect(createCastaiMcpDoctor({})).toEqual({
      mppConfigured: false,
      network: "casper:testnet",
      signerConfigured: false,
      x402Configured: false,
    });
  });

  it("reads Casper signer environment names", () => {
    const doctor = createCastaiMcpDoctor(
      {
        CASPER_NETWORK: "casper:mainnet",
        CASPER_PRIVATE_KEY_PEM: "test",
      },
      {
        mpp: async () => new Response("mpp"),
        x402: async () => new Response("x402"),
      }
    );

    expect(doctor).toEqual({
      mppConfigured: true,
      network: "casper:mainnet",
      signerConfigured: true,
      x402Configured: true,
    });
  });
});
