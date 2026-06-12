export const SUPPORTED_CASPER_NETWORKS = [
  "casper:mainnet",
  "casper:testnet",
] as const;

export type CasperNetwork = (typeof SUPPORTED_CASPER_NETWORKS)[number];

export const CASPER_RPC_URL_ENV = {
  "casper:mainnet": "CASPER_MAINNET_RPC_URL",
  "casper:testnet": "CASPER_TESTNET_RPC_URL",
} as const satisfies Record<CasperNetwork, keyof CloudflareBindings>;
