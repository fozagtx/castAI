# MPP Casper Example

Demonstrates an MPP paywall using native Casper CSPR transfers.

## Setup

```sh
bun install
cp .env.example .env
```

Required values:

| Variable | Description |
|---|---|
| `CASPER_NETWORK` | `casper:testnet` or `casper:mainnet` |
| `CASPER_RECIPIENT` | Seller Casper public key |
| `CASPER_PRIVATE_KEY_PEM` | Buyer Casper private key in PEM format |
| `SERVER_URL` | Seller server URL |

## Run

```sh
bun run server.ts
bun run client.ts
```
