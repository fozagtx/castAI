import { registerExactCasperScheme } from "@castai/x402/server";
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { paymentMiddleware } from "@x402/hono";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

function env(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const network = env("PAYMENT_NETWORK", "casper:testnet") as
  | "casper:mainnet"
  | "casper:testnet";

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
          price: "0.001",
          scheme: "exact",
        },
      ],
      description: "Paid weather data",
      mimeType: "application/json",
      resource: "http://localhost:3000/weather",
    },
    resourceServer
  )
);

app.get("/weather", (c) =>
  c.json({
    report: {
      temperature: 70,
      weather: "sunny",
    },
  })
);

serve({ fetch: app.fetch, port: 3000 });
console.log("x402 gated server listening on http://localhost:3000");
