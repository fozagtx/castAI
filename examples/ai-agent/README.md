# castAI AI Agent Example

This example shows an AI SDK agent that can request paid x402 and MPP resources
with Casper CSPR payments.

## Environment

```txt
CASPER_PRIVATE_KEY_PEM=-----BEGIN PRIVATE KEY-----
CASPER_RECIPIENT=01...
FACILITATOR_URL=http://localhost:8787
PAYMENT_NETWORK=casper:testnet
AI_MODEL=openai/gpt-4.1
```

Use funded Casper testnet keys for real payment tests.

## Run gated x402 resource

```sh
bun run server
```

## Run agent

```sh
bun run agent
```

The agent receives two tools:

- `payX402Resource`
- `payMppResource`

The example uses `generateCastaiText`, which wires those tools into Vercel AI SDK `generateText` and enables multi-step tool calls.

The tools use configured payment fetchers. Settlement success must come from the payment flow.
