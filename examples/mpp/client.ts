import { Mppx } from "mppx/client";

import { casper } from "@castai/mpp/client";

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
      privateKeyPem: env("CASPER_PRIVATE_KEY_PEM"),
    }),
  ],
});

const baseUrl = env("SERVER_URL", "http://localhost:3000");
const response = await mppx.fetch(`${baseUrl}/weather`);
const data = await response.json();

console.log("Response:", data);
console.log("Payment-Receipt:", response.headers.get("payment-receipt"));
