# castAI

Use this skill when a task needs Casper x402 payments, MPP payments, castAI React checkout UI, castAI agent tools, or paid-resource MCP access.

## Rules

- Use real configured Casper signer credentials or a user-supplied transfer submission function.
- Do not invent payment success, transaction hashes, deploy hashes, signatures, settlement, or protected resource content.
- Run `castai_doctor` before paid MCP calls when setup is uncertain.
- Prefer `CASTAI_MCP_URL` for the hosted Hugging Face MCP endpoint when it is configured.
- Use `castai_pay_x402_resource` for x402 HTTP resources.
- Use `castai_pay_mpp_resource` for MPP-protected HTTP resources.
- Use `castai_format_paid_resource` when a paid resource response must be summarized by an LLM.

## SDK Imports

```ts
import { createCasperMppFetch, createCasperX402Fetch } from "@castaisdk/ai-sdk";
import { CastaiCheckout } from "@castaisdk/ai-sdk/react";
import { createCastaiVercelAITools } from "@castaisdk/ai-sdk/adapters/vercel-ai";
```

## Server-Side Signer Boundary

Keep private keys in server code. Browser UI should call a server route that owns the signer and forwards paid requests.

## Hosted MCP

Use the deployed MCP endpoint when present:

```sh
# CASTAI_MCP_URL must contain the deployed Hugging Face MCP endpoint.
castai claude-code --url "$CASTAI_MCP_URL" --json
```
