# @castai/ai-sdk

AI SDK tools and React developer components for castAI Casper x402 and MPP payments.

## AI SDK tools

```ts
import { generateCastaiText } from "@castai/ai-sdk";

const result = await generateCastaiText({
  model: "openai/gpt-4.1",
  x402: {
    networks: ["casper:testnet"],
    privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
  },
  prompt: "Fetch https://api.example.com/weather with x402 payment.",
});

console.log(result.text);
```

Use lower-level tools when you already own the paid fetcher:

```ts
import { createCastaiAgentTools, createCasperX402Fetch } from "@castai/ai-sdk";
import { generateText } from "ai";

const x402Fetch = createCasperX402Fetch({
  networks: ["casper:testnet"],
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});

const result = await generateText({
  model: "openai/gpt-4.1",
  tools: createCastaiAgentTools({ x402: { fetch: x402Fetch } }),
  prompt: "Fetch https://api.example.com/weather with x402 payment.",
});
```

## LLM text

```ts
import { fetchResource, llm } from "@castai/ai-sdk";

const response = await fetchResource(x402Fetch, {
  url: "https://api.example.com/weather",
});

const text = llm.text(response);
```

## React tester

```tsx
import { createCasperX402Fetch } from "@castai/ai-sdk";
import { PaymentTester } from "@castai/ai-sdk/react";

const x402Fetch = createCasperX402Fetch({
  networks: ["casper:testnet"],
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});

export function DevPaymentPanel() {
  return <PaymentTester defaultUrl="https://api.example.com/weather" x402Fetch={x402Fetch} />;
}
```

## React layers

Hooks:

```tsx
import { useCastaiPayment } from "@castai/ai-sdk/react/headless";

const payment = useCastaiPayment({
  request: { url: "https://api.example.com/weather" },
  scheme: "x402",
  x402Fetch,
});
```

Headless component:

```tsx
import { CastaiCheckoutHeadless } from "@castai/ai-sdk/react/headless";
```

Styled UI kit:

```tsx
import { CastaiCheckout, PaymentTester } from "@castai/ai-sdk/react/ui";
```

## Checkout UI

```tsx
import { createCasperX402Fetch } from "@castai/ai-sdk";
import { CastaiCheckout, renderCastaiCheckout } from "@castai/ai-sdk/react";

const x402Fetch = createCasperX402Fetch({
  networks: ["casper:testnet"],
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});

export function Checkout() {
  return (
    <CastaiCheckout
      amount="0.001"
      network="casper:testnet"
      recipient={process.env.CASPER_RECIPIENT}
      request={{ url: "https://api.example.com/weather" }}
      scheme="x402"
      x402Fetch={x402Fetch}
    />
  );
}

await renderCastaiCheckout({
  amount: "0.001",
  container: "#castai-checkout",
  network: "casper:testnet",
  recipient: process.env.CASPER_RECIPIENT,
  request: { url: "https://api.example.com/weather" },
  scheme: "x402",
  x402Fetch,
});
```

## Framework adapters

```ts
import { createCastaiVercelAITools } from "@castai/ai-sdk/adapters/vercel-ai";
import { createCastaiOpenAITools } from "@castai/ai-sdk/adapters/openai";
import { createCastaiLangChainTools } from "@castai/ai-sdk/adapters/langchain";
import { createCastaiAgentKitActionProvider } from "@castai/ai-sdk/adapters/agentkit";
import { createCastaiGoatPlugin } from "@castai/ai-sdk/adapters/goat";
```
