import { generateCastaiText } from "@castaisdk/ai-sdk";

type PaymentNetwork = "casper:mainnet" | "casper:testnet";

function env(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const network = env("PAYMENT_NETWORK", "casper:testnet") as PaymentNetwork;

const result = await generateCastaiText({
  model: env("AI_MODEL", "openai/gpt-4.1"),
  mpp: {
    network,
    privateKeyPem: env("CASPER_PRIVATE_KEY_PEM"),
  },
  prompt: env(
    "AGENT_PROMPT",
    "Fetch the paid x402 weather resource at http://localhost:3000/weather and summarize the JSON."
  ),
  x402: {
    networks: [network],
    privateKeyPem: env("CASPER_PRIVATE_KEY_PEM"),
  },
});

console.log(result.text);
console.log(JSON.stringify(result.toolResults, null, 2));
