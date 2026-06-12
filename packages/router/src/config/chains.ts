export const SUPPORTED_CASPER_NETWORKS = [
  "casper:mainnet",
  "casper:testnet",
] as const;

export type SupportedCasperNetwork = (typeof SUPPORTED_CASPER_NETWORKS)[number];

export const SUPPORTED_NETWORKS = SUPPORTED_CASPER_NETWORKS;
export type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number];

export const CASPER_CHAIN_NAME = {
  "casper:mainnet": "casper",
  "casper:testnet": "casper-test",
} as const satisfies Record<SupportedNetwork, string>;
