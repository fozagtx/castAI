import { casper } from "@castai/mpp/server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { Mppx } from "mppx/hono";

function env(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

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

app.get("/weather", charge({ amount: "0.001" }), (c) =>
  c.json({
    report: {
      weather: "sunny",
      temperature: 70,
    },
  })
);

export default app;
