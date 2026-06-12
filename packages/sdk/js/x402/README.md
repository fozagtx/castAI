# @castai/x402

Casper support for x402 `exact` payments.

## Install

```sh
bun add @castai/x402 @x402/core casper-js-sdk
```

## Server

```ts
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { registerExactCasperScheme } from "@castai/x402/server";

const server = new x402ResourceServer(
  new HTTPFacilitatorClient({ url: process.env.FACILITATOR_URL })
);

registerExactCasperScheme(server, {
  networks: ["casper:testnet"],
});
```

## Client

```ts
import { x402Client } from "@x402/core/client";
import { registerExactCasperClientScheme } from "@castai/x402/client";

const client = new x402Client();

registerExactCasperClientScheme(client, {
  networks: ["casper:testnet"],
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});
```

## Facilitator

```ts
import { x402Facilitator } from "@x402/core/facilitator";
import { registerExactCasperFacilitatorScheme } from "@castai/x402/facilitator";

const facilitator = new x402Facilitator();

registerExactCasperFacilitatorScheme(facilitator, {
  networks: ["casper:testnet"],
});
```

## Payment Payload

The client submits a real Casper deploy and sends its hash as the x402 payload:

```ts
{
  type: "deployHash",
  deployHash: "..."
}
```

The facilitator verifies:

| Check | Rule |
|---|---|
| Network | `casper:mainnet` or `casper:testnet` |
| Scheme | `exact` |
| Asset | `CSPR` |
| Amount | Matches required motes |
| Recipient | Matches `payTo` public key or account hash |
| Execution | Casper RPC reports executed deploy data |

## Supported Networks

| x402 network | Casper chain name | Asset |
|---|---|---|
| `casper:mainnet` | `casper` | `CSPR` |
| `casper:testnet` | `casper-test` | `CSPR` |
