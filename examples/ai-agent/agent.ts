import {
  createCastaiAgentTools,
  createCasperMppFetch,
  createCasperX402Fetch,
} from "@castai/ai-sdk";
import { generateText } from "ai";

function env(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const x402Fetch = createCasperX402Fetch({
  networks: ["casper:testnet"],
  privateKeyPem: env("CASPER_PRIVATE_KEY_PEM"),
});

const mppFetch = createCasperMppFetch({
  network: "casper:testnet",
  privateKeyPem: env("CASPER_PRIVATE_KEY_PEM"),
});

const result = await generateText({
  model: env("AI_MODEL", "openai/gpt-4.1"),
  tools: createCastaiAgentTools({
    mpp: { fetch: mppFetch },
    x402: { fetch: x402Fetch },
  }),
  prompt: env(
    "AGENT_PROMPT",
    "Fetch the paid x402 weather resource at http://localhost:3000/weather and summarize the JSON."
  ),
});

console.log(result.text);
console.log(JSON.stringify(result.toolResults, null, 2));
