# @castai/ai-sdk

AI SDK tools and React developer components for castAI Casper x402 and MPP payments.

## AI SDK tools

```ts
import { createCastaiAgentTools, createCasperX402Fetch } from "@castai/ai-sdk";
import { generateText } from "ai";

const x402Fetch = createCasperX402Fetch({
  networks: ["casper:testnet"],
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});

const result = await generateText({
  model: "openai/gpt-4.1",
  tools: createCastaiAgentTools({
    x402: { fetch: x402Fetch },
  }),
  prompt: "Fetch https://api.example.com/weather with x402 payment.",
});
```

## React tester

```tsx
import { PaymentTester } from "@castai/ai-sdk/react";
import { createCasperX402Fetch } from "@castai/ai-sdk";

const x402Fetch = createCasperX402Fetch({
  networks: ["casper:testnet"],
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});

export function DevPaymentPanel() {
  return <PaymentTester defaultUrl="https://api.example.com/weather" x402Fetch={x402Fetch} />;
}
```
