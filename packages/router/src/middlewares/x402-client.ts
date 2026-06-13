import { x402Client as X402Client } from "@x402/core/client";
import { createMiddleware } from "hono/factory";

import { registerExactCasperClientScheme } from "@castaisdk/x402/client";

import type { SupportedNetwork } from "../config/chains";
import type { Env } from "../env";
import { SUPPORTED_NETWORKS } from "../config/chains";

export type X402ClientVariables = {
  X402_CLIENT: X402Client;
};

export const PRIVATE_KEY_ENV_MAPPING = {
  "casper:mainnet": "CASPER_MAINNET_PRIVATE_KEY",
  "casper:testnet": "CASPER_TESTNET_PRIVATE_KEY",
} as const satisfies Record<SupportedNetwork, keyof CloudflareBindings>;

export const x402ClientMiddleware = () =>
  createMiddleware<Env>(async (c, next) => {
    const x402Client = new X402Client();

    for (const network of SUPPORTED_NETWORKS) {
      const privateKeyPem = c.env[PRIVATE_KEY_ENV_MAPPING[network]];
      if (!privateKeyPem) continue;

      registerExactCasperClientScheme(x402Client, {
        networks: [network],
        privateKeyPem,
      });
    }

    c.set("X402_CLIENT", x402Client);

    return next();
  });
