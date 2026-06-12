import { registerExactCasperScheme } from "@castai/x402/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { Hono } from "hono";
import { logger } from "hono/logger";

function env(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const app = new Hono();
const network = env("DESTINATION_NETWORK", "casper:testnet");
const payTo = env("DESTINATION_RECIPIENT");
const facilitatorUrl = env("FACILITATOR_URL");

const resourceServer = new x402ResourceServer(
  new HTTPFacilitatorClient({ url: facilitatorUrl })
);

registerExactCasperScheme(resourceServer, {
  networks: [network as "casper:mainnet" | "casper:testnet"],
});

app.use(logger());

app.use(
  paymentMiddleware(
    {
      "GET /weather": {
        accepts: [
          {
            scheme: "exact",
            price: "0.001",
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

app.get("/weather", (c) =>
  c.json({
    report: {
      weather: "sunny",
      temperature: 70,
    },
  })
);

export default app;
