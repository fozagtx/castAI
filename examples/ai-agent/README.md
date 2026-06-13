# castAI AI Agent Example

This example runs an AI SDK agent that can request paid x402 and MPP resources
with Casper CSPR payments.

The gated x402 server fetches JSON from `RESOURCE_UPSTREAM_URL` after payment
middleware accepts the request.

## Configure

```sh
cp .env.example .env
```

Required values:

| Variable | Description |
| --- | --- |
| `CASPER_PRIVATE_KEY_PEM` | Funded Casper buyer private key in PEM format |
| `CASPER_RECIPIENT` | Seller Casper public key |
| `FACILITATOR_URL` | x402 facilitator URL |
| `PAYMENT_NETWORK` | `casper:testnet` or `casper:mainnet` |

## Install

```sh
npm install
```

```sh
pnpm install
```

```sh
yarn install
```

```sh
bun install
```

## Run Gated x402 Resource

```sh
npm run server
```

```sh
pnpm server
```

```sh
yarn server
```

```sh
bun run server
```

## Run Agent

```sh
npm run agent
```

```sh
pnpm agent
```

```sh
yarn agent
```

```sh
bun run agent
```

The agent receives two tools:

| Tool | Purpose |
| --- | --- |
| `payX402Resource` | Request an x402-protected HTTP resource |
| `payMppResource` | Request an MPP-protected HTTP resource |

`generateCastaiText` wires those tools into Vercel AI SDK `generateText` with
multi-step tool calls enabled.
