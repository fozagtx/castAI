# @castai/mpp

Casper CSPR payment method for MPP.

## Install

```sh
bun add @castai/mpp mppx casper-js-sdk
```

## Server

```ts
import { Mppx } from "mppx/server";
import { casper } from "@castai/mpp/server";

const mppx = Mppx.create({
  methods: [
    casper({
      network: "casper:testnet",
      recipient: "01...",
    }),
  ],
});
```

## Client

```ts
import { Mppx } from "mppx/client";
import { casper } from "@castai/mpp/client";

const mppx = Mppx.create({
  methods: [
    casper({
      network: "casper:testnet",
      privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
    }),
  ],
});
```

## Credential Payloads

The method accepts real Casper hashes:

```ts
{ type: "deployHash", deployHash: "..." }
{ type: "transactionHash", transactionHash: "..." }
```

The server verifies the deploy against Casper RPC before returning a receipt.

## Supported Networks

| Network | Chain name | Default RPC |
|---|---|---|
| `casper:mainnet` | `casper` | `https://node.mainnet.casper.network/rpc` |
| `casper:testnet` | `casper-test` | `https://node.testnet.casper.network/rpc` |

## Asset

| Asset | Unit | Decimals |
|---|---|---|
| `CSPR` | motes | 9 |
