import { describe, expect, it } from "vitest";

import { CASPER_RPC_URL_ENV, SUPPORTED_CASPER_NETWORKS } from "./casper";

describe("Casper facilitator network config", () => {
  it("supports mainnet and testnet only", () => {
    expect(SUPPORTED_CASPER_NETWORKS).toEqual([
      "casper:mainnet",
      "casper:testnet",
    ]);
  });

  it("maps supported networks to RPC env names", () => {
    expect(CASPER_RPC_URL_ENV).toEqual({
      "casper:mainnet": "CASPER_MAINNET_RPC_URL",
      "casper:testnet": "CASPER_TESTNET_RPC_URL",
    });
  });
});
