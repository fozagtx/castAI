# castAI

Casper CSPR payments for x402, MPP, and AI agents.

castAI provides TypeScript packages for services and agents that need paid HTTP
requests settled on Casper.

## Packages

| Package | Purpose |
| --- | --- |
| `@castai/ai-sdk` | AI SDK tools, `generateCastaiText`, `llm.text`, checkout UI, and React developer components |
| `@castai/cli` | Scaffolder and config generator for checkout, agent, and MCP projects |
| `@castai/mcp` | MCP server for x402 and MPP paid-resource tools |
| `@castai/x402` | x402 `exact` scheme support for Casper CSPR transfers |
| `@castai/mpp` | MPP `casper` charge method for native CSPR transfers |
| `@castai/facilitator` | x402 verification and settlement service for Casper payments |
| `@castai/router` | x402 payment router for protected HTTP resources |

## Install

```sh
npm install @castai/ai-sdk ai @castai/x402 @castai/mpp casper-js-sdk
```

```sh
pnpm add @castai/ai-sdk ai @castai/x402 @castai/mpp casper-js-sdk
```

```sh
yarn add @castai/ai-sdk ai @castai/x402 @castai/mpp casper-js-sdk
```

```sh
bun add @castai/ai-sdk ai @castai/x402 @castai/mpp casper-js-sdk
```

CLI and MCP:

```sh
npm install -g @castai/cli
npm install @castai/mcp
```

```sh
pnpm add -g @castai/cli
pnpm add @castai/mcp
```

```sh
yarn global add @castai/cli
yarn add @castai/mcp
```

```sh
bun add -g @castai/cli
bun add @castai/mcp
```

## AI Agent

```ts
import { generateCastaiText } from "@castai/ai-sdk";

const result = await generateCastaiText({
  model: process.env.AI_MODEL ?? "openai/gpt-4.1",
  x402: {
    networks: ["casper:testnet"],
    privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
  },
  mpp: {
    network: "casper:testnet",
    privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
  },
  prompt:
    "Fetch the paid x402 weather resource at http://localhost:3000/weather and summarize the JSON.",
});

console.log(result.text);
```

## Checkout UI

React component:

```tsx
import { createCasperX402Fetch } from "@castai/ai-sdk";
import { CastaiCheckout } from "@castai/ai-sdk/react";

const x402Fetch = createCasperX402Fetch({
  networks: ["casper:testnet"],
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});

export function Checkout() {
  return (
    <CastaiCheckout
      amount="0.001"
      network="casper:testnet"
      recipient={process.env.CASPER_RECIPIENT}
      request={{ url: "https://api.example.com/protected" }}
      scheme="x402"
      x402Fetch={x402Fetch}
    />
  );
}
```

Headless React state:

```tsx
import { useCastaiPayment } from "@castai/ai-sdk/react/headless";

export function PayButton({ x402Fetch }) {
  const payment = useCastaiPayment({
    request: { url: "https://api.example.com/protected" },
    scheme: "x402",
    x402Fetch,
  });

  return (
    <button disabled={!payment.canSubmit} onClick={() => payment.submit()}>
      Pay
    </button>
  );
}
```

## Framework Adapters

```ts
import { createCastaiVercelAITools } from "@castai/ai-sdk/adapters/vercel-ai";
import { createCastaiOpenAITools } from "@castai/ai-sdk/adapters/openai";
import { createCastaiLangChainTools } from "@castai/ai-sdk/adapters/langchain";
import { createCastaiAgentKitActionProvider } from "@castai/ai-sdk/adapters/agentkit";
import { createCastaiGoatPlugin } from "@castai/ai-sdk/adapters/goat";
```

## MCP and CLI

```sh
castai templates
castai scaffold next-checkout ./my-checkout --package-manager pnpm
castai claude-code --json
castai-mcp
```

Claude Code plugin files are in `plugins/claude-code/castai`.

Programmatic DOM mount:

```tsx
import { createCasperX402Fetch } from "@castai/ai-sdk";
import { renderCastaiCheckout } from "@castai/ai-sdk/react";

const x402Fetch = createCasperX402Fetch({
  networks: ["casper:testnet"],
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});

await renderCastaiCheckout({
  amount: "0.001",
  container: "#castai-checkout",
  network: "casper:testnet",
  recipient: process.env.CASPER_RECIPIENT,
  request: { url: "https://api.example.com/protected" },
  scheme: "x402",
  x402Fetch,
});
```

## x402

Server:

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

Client:

```ts
import { x402Client } from "@x402/core/client";
import { registerExactCasperClientScheme } from "@castai/x402/client";

const client = new x402Client();

registerExactCasperClientScheme(client, {
  networks: ["casper:testnet"],
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});
```

## MPP

Server:

```ts
import { Mppx } from "mppx/server";
import { casper } from "@castai/mpp/server";

const mppx = Mppx.create({
  methods: [
    casper({
      network: "casper:testnet",
      recipient: process.env.CASPER_RECIPIENT,
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

## Agent-Readable Docs

The documentation exposes AI-readable Markdown routes:

| Route | Purpose |
| --- | --- |
| `/llms.txt` | Index of docs pages for coding agents |
| `/llms-full.txt` | Full Markdown export of docs pages |
| `/docs-md/...` | Markdown for a single docs page |
| `/skills/openclaw.md` | OpenClaw skill for castAI builds |

Each docs page also includes top actions for copying Markdown, viewing Markdown,
opening the page in ChatGPT, and opening the source on GitHub.

## Development

```sh
npm install --ignore-scripts
npm run lint
npm run typecheck
npm run build
```

```sh
pnpm install --ignore-scripts
pnpm lint
pnpm typecheck
pnpm build
```

```sh
yarn install --ignore-scripts
yarn lint
yarn typecheck
yarn build
```

```sh
bun install --ignore-scripts
bun run lint
bun run typecheck
bun run build
```

## License

Apache-2.0. See [LICENSE](./LICENSE).
