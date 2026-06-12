import { describe, expect, it } from "vitest";

import { CASPER_CHAIN_NAME, SUPPORTED_NETWORKS } from "./chains";

describe("Casper router network config", () => {
  it("supports mainnet and testnet only", () => {
    expect(SUPPORTED_NETWORKS).toEqual(["casper:mainnet", "casper:testnet"]);
  });

  it("maps supported networks to Casper chain names", () => {
    expect(CASPER_CHAIN_NAME).toEqual({
      "casper:mainnet": "casper",
      "casper:testnet": "casper-test",
    });
  });
});
