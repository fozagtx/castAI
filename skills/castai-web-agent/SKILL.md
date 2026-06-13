---
name: castai-web-agent
description: Use when building web apps, docs, API routes, AI agents, or coding-agent workflows with castAI Casper x402, MPP, router, facilitator, or @castaisdk/ai-sdk. Emphasizes real Casper payment flows, server-side signer handling, llms.txt, and developer verification.
---

# castAI Web Agent

## Use This Skill For

- Adding x402 or MPP paid-resource access to a web app.
- Adding AI SDK tools that can pay for protected HTTP resources.
- Building server routes that own Casper signer material.
- Writing docs, examples, or `llms.txt` for castAI integrations.
- Auditing whether a castAI integration uses the real payment path.

## Non-Negotiables

- Do not invent payment success, signatures, deploy hashes, transaction hashes, settlement, or protected content.
- Do not put Casper private keys in browser bundles.
- Do not describe oracle feeds or RWA attestation unless the current repo explicitly contains that feature.
- Prefer testnet defaults for examples. Mainnet must be explicit.
- Every code path must fail loudly when signer, recipient, facilitator, or RPC config is missing.

## Package Selection

- x402-protected HTTP resource: use `@castaisdk/x402` or `createCasperX402Fetch`.
- MPP-protected HTTP resource: use `@castaisdk/mpp` or `createCasperMppFetch`.
- AI agent fetching paid resources: use `@castaisdk/ai-sdk`.
- Local developer UI: use `PaymentTester` from `@castaisdk/ai-sdk/react`.
- Router/facilitator service work: inspect `packages/router` and `packages/facilitator`.

## AI SDK Pattern

Use the high-level helper first:

```ts
import { generateCastaiText } from "@castaisdk/ai-sdk";

const result = await generateCastaiText({
  model: "openai/gpt-4.1",
  x402: {
    networks: ["casper:testnet"],
    privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
  },
  prompt: "Fetch the paid endpoint and summarize the JSON.",
});

console.log(result.text);
```

Use lower-level tools only when the app already has a paid fetcher:

```ts
import { createCastaiAgentTools } from "@castaisdk/ai-sdk";
import { generateText } from "ai";

const result = await generateText({
  model: "openai/gpt-4.1",
  tools: createCastaiAgentTools({ x402: { fetch: x402Fetch } }),
  prompt: "Fetch the paid endpoint.",
});
```

## LLM Text Pattern

When a paid response needs to become prompt text:

```ts
import { getPaidResourceText, llm } from "@castaisdk/ai-sdk";

const text = await getPaidResourceText(x402Fetch, {
  url: "https://api.example.com/protected",
});

const otherText = llm.text(response);
```

## Web App Pattern

- Keep signer code in server routes, server actions, background jobs, or protected API services.
- Browser UI should call your server route, not import signer keys.
- For quick local verification, render `PaymentTester` and pass server-safe fetchers only in server-capable environments.
- Add inline setup errors for missing network, recipient, facilitator URL, RPC URL, and signer config.

## Verification

Run the checks available in the repo:

```sh
bun run lint
bun run typecheck
bun run build
```

For package-level changes, also run the package tests:

```sh
bun run test
```

For docs changes, load `/docs` and `/llms.txt` locally and verify visible text is product-accurate.
