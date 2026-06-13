# castAI OpenClaw Skill

Use this skill when building apps or agents that use castAI, Casper CSPR, x402, MPP, paid HTTP resources, or checkout UI.

## Read First

- `/llms.txt`
- `/llms-full.txt`
- `/docs/ai-sdk`
- `/docs/ai-sdk/llm-text`
- `/docs/ai-sdk/ui-components`
- `/docs/x402/quickstart`
- `/docs/mpp/quickstart`

## Rules

- Use `@castaisdk/ai-sdk` for AI SDK agents.
- Use `@castaisdk/ai-sdk/react` for developer UI and checkout UI.
- Use `@castaisdk/x402` for x402 `exact` Casper payment flows.
- Use `@castaisdk/mpp` for MPP Casper payment flows.
- Keep Casper private keys on the server side for browser apps.
- Use funded Casper testnet keys for testnet payment tests.
- Report payment errors from the SDK result instead of inventing settlement success.

## Install

```sh
npm install @castaisdk/ai-sdk ai @castaisdk/x402 @castaisdk/mpp casper-js-sdk
```

```sh
pnpm add @castaisdk/ai-sdk ai @castaisdk/x402 @castaisdk/mpp casper-js-sdk
```

```sh
yarn add @castaisdk/ai-sdk ai @castaisdk/x402 @castaisdk/mpp casper-js-sdk
```

```sh
bun add @castaisdk/ai-sdk ai @castaisdk/x402 @castaisdk/mpp casper-js-sdk
```

## Checkout UI

React component:

```tsx
import { createCasperX402Fetch } from "@castaisdk/ai-sdk";
import { CastaiCheckout } from "@castaisdk/ai-sdk/react";

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
      request={{ url: "https://api.example.com/protected" }}
      scheme="x402"
      x402Fetch={x402Fetch}
    />
  );
}
```

Programmatic DOM mount:

```tsx
import { createCasperX402Fetch } from "@castaisdk/ai-sdk";
import { renderCastaiCheckout } from "@castaisdk/ai-sdk/react";

const x402Fetch = createCasperX402Fetch({
  networks: ["casper:testnet"],
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});

await renderCastaiCheckout({
  amount: "0.001",
  container: "#castai-checkout",
  network: "casper:testnet",
  recipient: process.env.CASPER_RECIPIENT,
  request: { url: "https://api.example.com/protected" },
  scheme: "x402",
  x402Fetch,
});
```

## AI Agent

```ts
import { generateCastaiText } from "@castaisdk/ai-sdk";

const result = await generateCastaiText({
  model: "openai/gpt-4.1",
  x402: {
    networks: ["casper:testnet"],
    privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
  },
  prompt: "Fetch the paid resource and summarize the JSON.",
});

console.log(result.text);
```
