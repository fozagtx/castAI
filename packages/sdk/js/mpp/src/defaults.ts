import { PublicKey } from "casper-js-sdk";

export const network = {
  mainnet: "casper:mainnet",
  testnet: "casper:testnet",
} as const;

export type Network = (typeof network)[keyof typeof network];

export const chainName = {
  [network.mainnet]: "casper",
  [network.testnet]: "casper-test",
} as const satisfies Record<Network, string>;

export const rpcUrl = {
  [network.mainnet]: "https://node.mainnet.casper.network/rpc",
  [network.testnet]: "https://node.testnet.casper.network/rpc",
} as const satisfies Record<Network, string>;

export const currency = "CSPR";
export const decimals = 9;
export const defaultPaymentAmount = "100000000";

export function resolveNetwork(parameters: {
  network?: Network | undefined;
  testnet?: boolean | undefined;
}): Network {
  if (parameters.network) return parameters.network;
  return parameters.testnet ? network.testnet : network.mainnet;
}

export function resolveChainName(value: Network): string {
  return chainName[value];
}

export function resolveRpcUrl(value: Network): string {
  return rpcUrl[value];
}

export function toMotes(amount: string, precision = decimals): string {
  const trimmed = amount.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`Invalid CSPR amount: ${amount}`);
  }

  const [whole, fraction = ""] = trimmed.split(".");
  if (fraction.length > precision) {
    throw new Error(`CSPR amount has more than ${precision} decimal places.`);
  }

  return `${whole}${fraction.padEnd(precision, "0")}`.replace(/^0+(?=\d)/, "");
}

export function accountHashFromPublicKeyHex(publicKeyHex: string): string {
  return PublicKey.fromHex(publicKeyHex).accountHash().toPrefixedString();
}

export function isCasperPublicKeyHex(value: string): boolean {
  try {
    PublicKey.fromHex(value);
    return true;
  } catch {
    return false;
  }
}
