import { registerExactCasperClientScheme } from "@castai/x402/client";
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { wrapFetchWithPayment } from "@x402/fetch";

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
const routerUrl = env("ROUTER_URL", "http://localhost:8787");
const destination = "http://localhost:3000/weather";

const response = await fetchWithPayment(
  `${routerUrl}/route/x402?url=${encodeURIComponent(destination)}`
);

const data = await response.json();
console.log("Response:", data);

if (response.ok) {
  const httpClient = new x402HTTPClient(client);
  const paymentResponse = httpClient.getPaymentSettleResponse((name) =>
    response.headers.get(name)
  );
  console.log("Router settlement:", paymentResponse.transaction);
}
