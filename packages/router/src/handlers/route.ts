import type { PaymentOption } from "@x402/core/http";
import { zValidator } from "@hono/zod-validator";
import { decodePaymentRequiredHeader } from "@x402/core/http";
import { wrapFetchWithPayment } from "@x402/fetch";
import { paymentMiddleware } from "@x402/hono";
import { Hono } from "hono";
import { proxy } from "hono/proxy";
import { z } from "zod";

import type { SupportedNetwork } from "../config/chains";
import type { Env } from "../env";
import { SUPPORTED_NETWORKS } from "../config/chains";
import { internalServerError } from "../errors";
import { declareRouterExtension } from "../lib/x402/router-extension";

const routeHandler = new Hono<Env>();

export const PAY_TO_ENV_MAPPING = {
  "casper:mainnet": "CASPER_MAINNET_PAY_TO",
  "casper:testnet": "CASPER_TESTNET_PAY_TO",
} as const satisfies Record<SupportedNetwork, keyof CloudflareBindings>;

routeHandler.all(
  "/x402",
  zValidator(
    "query",
    z.object({
      url: z.url(),
    })
  ),
  async (c, next) => {
    const x402Server = c.get("X402_SERVER");
    const { url } = c.req.valid("query");

    const proxyResponse = await proxy(url, c.req);
    if (proxyResponse.ok) return proxyResponse;

    if (!proxyResponse.ok && proxyResponse.status !== 402) return proxyResponse;

    const decodedPaymentRequiredHeader =
      proxyResponse.headers.get("payment-required");
    if (!decodedPaymentRequiredHeader) return proxyResponse;

    const paymentRequired = decodePaymentRequiredHeader(
      decodedPaymentRequiredHeader
    );

    const accepts: PaymentOption[] = paymentRequired.accepts.flatMap(
      (requirement) => {
        const network = requirement.network as SupportedNetwork;
        if (!SUPPORTED_NETWORKS.includes(network)) return [];
        if (requirement.scheme !== "exact") return [];

        const payTo = c.env[PAY_TO_ENV_MAPPING[network]];
        if (!payTo) return [];

        return {
          scheme: requirement.scheme,
          network,
          payTo,
          price: {
            asset: "CSPR",
            amount: requirement.amount,
            extra: {
              ...requirement.extra,
              assetSymbol: "CSPR",
              decimals: 9,
            },
          },
        };
      }
    );

    if (accepts.length === 0) return proxyResponse;

    return paymentMiddleware(
      {
        accepts,
        description: paymentRequired.resource.description,
        mimeType: paymentRequired.resource.mimeType,
        resource: url,
        extensions: {
          ...declareRouterExtension({ url }),
        },
      },
      x402Server
    )(c, next);
  },
  async (c) => {
    try {
      const x402Client = c.get("X402_CLIENT");
      const { url } = c.req.valid("query");

      const fetchWithPayment = wrapFetchWithPayment(fetch, x402Client);
      const response = await fetchWithPayment(url);

      return response;
    } catch (err) {
      console.error({
        error: err instanceof Error ? err.name : "UnknownError",
      });

      return c.json(internalServerError, 500);
    }
  }
);

export { routeHandler };
