import { x402Client, x402HTTPClient } from "@x402/core/client";
import { wrapFetchWithPayment } from "@x402/fetch";

import { registerExactCasperClientScheme } from "@castaisdk/x402/client";

function env(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const network = env("PAYMENT_NETWORK", "casper:testnet");
const client = new x402Client();

registerExactCasperClientScheme(client, {
  networks: [network as "casper:mainnet" | "casper:testnet"],
  privateKeyPem: env("CASPER_PRIVATE_KEY_PEM"),
});

const fetchWithPayment = wrapFetchWithPayment(fetch, client);

const response = await fetchWithPayment(
  env("RESOURCE_URL", "https://api.example.com/weather")
);
const data = await response.json();
console.log("Response:", data);

if (response.ok) {
  const httpClient = new x402HTTPClient(client);
  const paymentResponse = httpClient.getPaymentSettleResponse((name) =>
    response.headers.get(name)
  );
  console.log("Casper deploy:", paymentResponse.transaction);
}
