import { x402Facilitator } from "@x402/core/facilitator";
import { createMiddleware } from "hono/factory";

import type { Env } from "../env";
import type { CasperNetwork } from "../lib/chains/casper";
import {
  CASPER_RPC_URL_ENV,
  SUPPORTED_CASPER_NETWORKS,
} from "../lib/chains/casper";
import { registerCasperExactScheme } from "../lib/x402/scheme";

export type X402FacilitatorClientVariables = {
  X402_FACILITATOR: x402Facilitator;
};

export const x402FacilitatorClient = () =>
  createMiddleware<Env>(async (c, next) => {
    const facilitator = new x402Facilitator();
    const rpcUrls: Partial<Record<CasperNetwork, string>> = {};

    for (const network of SUPPORTED_CASPER_NETWORKS) {
      const rpcUrl = c.env[CASPER_RPC_URL_ENV[network]];
      if (rpcUrl) rpcUrls[network] = rpcUrl;
    }

    registerCasperExactScheme(
      facilitator,
      [...SUPPORTED_CASPER_NETWORKS],
      rpcUrls,
      parseCsv(c.env.CASPER_FACILITATOR_SIGNERS)
    );

    c.set("X402_FACILITATOR", facilitator);

    return next();
  });

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
