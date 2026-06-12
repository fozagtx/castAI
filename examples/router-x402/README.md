# Router x402 Casper Example

Demonstrates a Casper x402 request through the castAI router.

## Setup

```sh
bun install
cp .env.example .env
```

Required values:

| Variable | Description |
|---|---|
| `FACILITATOR_URL` | castAI facilitator URL |
| `DESTINATION_NETWORK` | `casper:testnet` or `casper:mainnet` |
| `DESTINATION_RECIPIENT` | Destination server Casper public key |
| `PAYMENT_NETWORK` | Router-advertised Casper network |
| `CASPER_PRIVATE_KEY_PEM` | Buyer Casper private key in PEM format |
| `ROUTER_URL` | Router URL |

## Run

```sh
bun run server.ts
bun run client.ts
```
