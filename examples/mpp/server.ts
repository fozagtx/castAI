import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { Mppx } from "mppx/hono";

import { casper } from "@castaisdk/mpp/server";

function env(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const port = Number(env("PORT", "3000"));
const upstreamUrl = env(
  "RESOURCE_UPSTREAM_URL",
  "https://api.weather.gov/gridpoints/TOP/32,81/forecast"
);
const upstreamUserAgent = env("RESOURCE_USER_AGENT", "castai-mpp-example/0.1");

const mppx = Mppx.create({
  methods: [
    casper({
      network: env("CASPER_NETWORK", "casper:testnet") as
        | "casper:mainnet"
        | "casper:testnet",
      recipient: env("CASPER_RECIPIENT"),
    }),
  ],
});

const app = new Hono();

app.use(logger());
app.get("/", (c) => c.text("castAI Casper MPP example"));

const charge = mppx.charge;
if (!charge) throw new Error("MPP charge middleware is not available.");

app.get(
  "/weather",
  charge({ amount: env("PAYMENT_AMOUNT", "0.001") }),
  async (c) => {
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
  }
);

serve({ fetch: app.fetch, port });
console.log(`MPP example listening on http://localhost:${port}`);
