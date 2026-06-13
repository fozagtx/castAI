import { serve } from "@hono/node-server";
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { paymentMiddleware } from "@x402/hono";
import { Hono } from "hono";

import { registerExactCasperScheme } from "@castai/x402/server";

function env(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const network = env("PAYMENT_NETWORK", "casper:testnet") as
  | "casper:mainnet"
  | "casper:testnet";
const port = Number(env("PORT", "3000"));
const resourceUrl = `http://localhost:${port}/weather`;
const upstreamUrl = env(
  "RESOURCE_UPSTREAM_URL",
  "https://api.weather.gov/gridpoints/TOP/32,81/forecast"
);
const upstreamUserAgent = env(
  "RESOURCE_USER_AGENT",
  "castai-ai-agent-example/0.1"
);

const resourceServer = new x402ResourceServer(
  new HTTPFacilitatorClient({
    url: env("FACILITATOR_URL", "http://localhost:8787"),
  })
);

registerExactCasperScheme(resourceServer, {
  networks: [network],
});

const app = new Hono();

app.get("/", (c) => c.text("castAI x402 gated resource"));

app.use(
  "/weather",
  paymentMiddleware(
    {
      accepts: [
        {
          network,
          payTo: env("CASPER_RECIPIENT"),
          price: env("PAYMENT_PRICE", "0.001"),
          scheme: "exact",
        },
      ],
      description: "Paid weather data",
      mimeType: "application/json",
      resource: resourceUrl,
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
console.log(`x402 gated server listening on http://localhost:${port}`);
