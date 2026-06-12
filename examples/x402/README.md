# x402 Casper Example

Demonstrates a paid HTTP endpoint using x402 exact payments on Casper.

## Setup

```sh
bun install
cp .env.example .env
```

Required values:

| Variable | Description |
|---|---|
| `FACILITATOR_URL` | castAI facilitator URL |
| `PAYMENT_NETWORK` | `casper:testnet` or `casper:mainnet` |
| `PAYMENT_RECIPIENT` | Seller Casper public key |
| `CASPER_PRIVATE_KEY_PEM` | Buyer Casper private key in PEM format |

## Run

```sh
bun run server.ts
bun run client.ts
```
