# Router x402 Casper Example

Runs a Casper x402 request through the castAI router.

The destination `/weather` endpoint returns JSON fetched from
`RESOURCE_UPSTREAM_URL` after the payment path is accepted.

## Setup

```sh
npm install
cp .env.example .env
```

```sh
pnpm install
cp .env.example .env
```

```sh
yarn install
cp .env.example .env
```

```sh
bun install
cp .env.example .env
```

Required values:

| Variable | Description |
| --- | --- |
| `FACILITATOR_URL` | castAI facilitator URL |
| `DESTINATION_NETWORK` | `casper:testnet` or `casper:mainnet` |
| `DESTINATION_RECIPIENT` | Destination server Casper public key |
| `PAYMENT_NETWORK` | Router-advertised Casper network |
| `CASPER_PRIVATE_KEY_PEM` | Buyer Casper private key in PEM format |
| `ROUTER_URL` | Router URL |

## Run Destination Server

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

## Run Client

```sh
npm run client
```

```sh
pnpm client
```

```sh
yarn client
```

```sh
bun run client
```
