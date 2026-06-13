import { Mppx } from "mppx/client";

import { casper } from "@castaisdk/mpp/client";

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

const resourceUrl = env("RESOURCE_URL", "https://api.example.com/weather");
const response = await mppx.fetch(resourceUrl);
const data = await response.json();

console.log("Response:", data);
console.log("Payment-Receipt:", response.headers.get("payment-receipt"));
