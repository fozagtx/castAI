# x402 Casper Example

Runs a paid HTTP endpoint using x402 exact payments on Casper.

The `/weather` endpoint returns JSON fetched from `RESOURCE_UPSTREAM_URL` after
the x402 middleware accepts the Casper payment path.

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
| `PAYMENT_NETWORK` | `casper:testnet` or `casper:mainnet` |
| `PAYMENT_RECIPIENT` | Seller Casper public key |
| `CASPER_PRIVATE_KEY_PEM` | Buyer Casper private key in PEM format |

## Run Server

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
