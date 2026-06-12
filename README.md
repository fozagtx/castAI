<div align="center">
  <img width="80%" height="auto" src="assets/castai.svg" />

  <hr/>
</div>

## castAI

castAI is a Casper payment toolkit for AI agents and HTTP services.

It provides:

| Package | Role |
|---|---|
| `@castai/ai-sdk` | AI SDK tools and React test components for x402 and MPP agents |
| `@castai/x402` | x402 `exact` scheme support for Casper CSPR payments |
| `@castai/mpp` | MPP `casper` charge method for native CSPR transfers |
| `@castai/facilitator` | Cloudflare Worker facilitator for x402 verify/settle |
| `@castai/router` | Cloudflare Worker router for Casper x402 payment forwarding |

## Casper Support

Supported networks:

| Network | Chain name | Default RPC |
|---|---|---|
| `casper:mainnet` | `casper` | `https://node.mainnet.casper.network/rpc` |
| `casper:testnet` | `casper-test` | `https://node.testnet.casper.network/rpc` |

Supported asset:

| Asset | Unit | Decimals |
|---|---|---|
| `CSPR` | motes | 9 |

## x402

`@castai/x402` registers an x402 `exact` scheme for Casper.

Server side:

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

Client side:

```ts
import { x402Client } from "@x402/core/client";
import { registerExactCasperClientScheme } from "@castai/x402/client";

const client = new x402Client();

registerExactCasperClientScheme(client, {
  networks: ["casper:testnet"],
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});
```

Facilitator side:

```ts
import { x402Facilitator } from "@x402/core/facilitator";
import { registerExactCasperFacilitatorScheme } from "@castai/x402/facilitator";

const facilitator = new x402Facilitator();

registerExactCasperFacilitatorScheme(facilitator, {
  networks: ["casper:testnet"],
});
```

## AI SDK

`@castai/ai-sdk` exposes AI SDK tools for agents that can call paid x402 or
MPP resources.

```ts
import { createCastaiAgentTools, createCasperX402Fetch } from "@castai/ai-sdk";
import { generateText } from "ai";

const x402Fetch = createCasperX402Fetch({
  networks: ["casper:testnet"],
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});

const result = await generateText({
  model: "openai/gpt-4.1",
  tools: createCastaiAgentTools({
    x402: { fetch: x402Fetch },
  }),
  prompt: "Fetch the protected endpoint and summarize it.",
});
```

## MPP

`@castai/mpp` exposes a `casper` method for native CSPR transfer payments.

Server:

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

Client:

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

## Worker Environment

Facilitator:

```txt
CASPER_MAINNET_RPC_URL=https://node.mainnet.casper.network/rpc
CASPER_TESTNET_RPC_URL=https://node.testnet.casper.network/rpc
CASPER_FACILITATOR_SIGNERS=
```

Router:

```txt
FACILITATOR_URL=https://your-facilitator.example
CASPER_MAINNET_PAY_TO=01...
CASPER_TESTNET_PAY_TO=01...
CASPER_MAINNET_PRIVATE_KEY=
CASPER_TESTNET_PRIVATE_KEY=
```

## Scripts

```sh
bun install --ignore-scripts
bun run typecheck
bun run build
```

## Status

- `.git` has been removed from this cloned workspace.
- Active packages are named `@castai/*`.
- Active source uses Casper CSPR payments.
