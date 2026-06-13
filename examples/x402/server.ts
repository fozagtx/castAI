import { serve } from "@hono/node-server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { Hono } from "hono";
import { logger } from "hono/logger";

import { registerExactCasperScheme } from "@castai/x402/server";

type PaymentNetwork = "casper:mainnet" | "casper:testnet";

function env(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const app = new Hono();
const network = env("PAYMENT_NETWORK", "casper:testnet") as PaymentNetwork;
const payTo = env("PAYMENT_RECIPIENT");
const facilitatorUrl = env("FACILITATOR_URL");
const port = Number(env("PORT", "3000"));
const upstreamUrl = env(
  "RESOURCE_UPSTREAM_URL",
  "https://api.weather.gov/gridpoints/TOP/32,81/forecast"
);
const upstreamUserAgent = env("RESOURCE_USER_AGENT", "castai-x402-example/0.1");

const resourceServer = new x402ResourceServer(
  new HTTPFacilitatorClient({ url: facilitatorUrl })
);

registerExactCasperScheme(resourceServer, {
  networks: [network],
});

app.use(logger());

app.use(
  paymentMiddleware(
    {
      "GET /weather": {
        accepts: [
          {
            scheme: "exact",
            price: env("PAYMENT_PRICE", "0.001"),
            network,
            payTo,
          },
        ],
        description: "Weather data",
        mimeType: "application/json",
      },
    },
    resourceServer
  )
);

app.get("/weather", async (c) => {
  const response = await fetch(upstreamUrl, {
    headers: {
      "User-Agent": upstreamUserAgent,
    },
  });

  if (!response.ok) {
    return c.json(
      {
        error: "upstream_request_failed",
        source: upstreamUrl,
        status: response.status,
        statusText: response.statusText,
      },
      502
    );
  }

  return c.json({
    fetchedAt: new Date().toISOString(),
    source: upstreamUrl,
    value: await response.json(),
  });
});

serve({ fetch: app.fetch, port });
console.log(`x402 example listening on http://localhost:${port}`);
