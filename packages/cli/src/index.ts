import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export const packageManagers = ["npm", "pnpm", "yarn", "bun"] as const;
export type PackageManager = (typeof packageManagers)[number];

export type CastaiTemplateName =
  | "agent-vercel-ai"
  | "mcp-claude-code"
  | "next-checkout";

export type CastaiTemplate = {
  description: string;
  files: (options: TemplateRenderOptions) => Record<string, string>;
  name: CastaiTemplateName;
};

export type TemplateRenderOptions = {
  packageManager: PackageManager;
};

export type ScaffoldOptions = {
  directory: string;
  force?: boolean | undefined;
  packageManager?: PackageManager | undefined;
  template: CastaiTemplateName;
};

export type ScaffoldResult = {
  directory: string;
  files: string[];
  installCommand: string;
  packageManager: PackageManager;
  template: CastaiTemplateName;
};

export type CastaiDoctorResult = {
  node: string;
  packageManagers: readonly PackageManager[];
  signerConfigured: boolean;
  templates: CastaiTemplateName[];
};

export const templates: readonly CastaiTemplate[] = [
  {
    description: "Next.js checkout UI with a server-owned Casper x402 fetcher.",
    files: nextCheckoutTemplate,
    name: "next-checkout",
  },
  {
    description: "Vercel AI SDK agent wired to castAI x402 and MPP tools.",
    files: agentVercelAiTemplate,
    name: "agent-vercel-ai",
  },
  {
    description: "Claude Code MCP config and usage notes for castAI tools.",
    files: mcpClaudeCodeTemplate,
    name: "mcp-claude-code",
  },
];

export function listTemplates(): CastaiTemplate[] {
  return [...templates];
}

export function getTemplate(name: CastaiTemplateName): CastaiTemplate {
  const template = templates.find((candidate) => candidate.name === name);
  if (!template) throw new Error(`Unknown castAI template: ${name}`);
  return template;
}

export async function scaffoldTemplate(
  options: ScaffoldOptions
): Promise<ScaffoldResult> {
  const packageManager = options.packageManager ?? "npm";
  const template = getTemplate(options.template);
  const files = template.files({ packageManager });

  await mkdir(options.directory, { recursive: true });

  for (const [filePath, contents] of Object.entries(files)) {
    const target = join(options.directory, filePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents, {
      flag: options.force ? "w" : "wx",
    });
  }

  return {
    directory: options.directory,
    files: Object.keys(files),
    installCommand: installCommand(packageManager),
    packageManager,
    template: options.template,
  };
}

export function createDoctorResult(
  env: Record<string, string | undefined> = process.env
): CastaiDoctorResult {
  return {
    node: process.version,
    packageManagers,
    signerConfigured: Boolean(
      env.CASTAI_CASPER_PRIVATE_KEY_PEM ??
        env.CASPER_PRIVATE_KEY_PEM ??
        env.CASTAI_CASPER_PRIVATE_KEY_HEX ??
        env.CASPER_PRIVATE_KEY_HEX
    ),
    templates: templates.map((template) => template.name),
  };
}

export function createMcpConfig(
  options: {
    client?: "claude-code" | "generic" | undefined;
    packageManager?: PackageManager | undefined;
  } = {}
) {
  const packageManager = options.packageManager ?? "npm";
  const command = mcpCommand(packageManager);

  return {
    mcpServers: {
      castai: {
        args: command.args,
        command: command.command,
      },
    },
  };
}

export function assertPackageManager(value: string): PackageManager {
  if (packageManagers.includes(value as PackageManager)) {
    return value as PackageManager;
  }

  throw new Error(`Unsupported package manager: ${value}`);
}

export function installCommand(packageManager: PackageManager): string {
  if (packageManager === "bun") return "bun install";
  if (packageManager === "pnpm") return "pnpm install";
  if (packageManager === "yarn") return "yarn install";
  return "npm install";
}

function mcpCommand(packageManager: PackageManager) {
  if (packageManager === "bun") {
    return { args: ["@castaisdk/mcp@latest"], command: "bunx" };
  }
  if (packageManager === "pnpm") {
    return { args: ["dlx", "@castaisdk/mcp@latest"], command: "pnpm" };
  }
  if (packageManager === "yarn") {
    return { args: ["dlx", "@castaisdk/mcp@latest"], command: "yarn" };
  }
  return { args: ["-y", "@castaisdk/mcp@latest"], command: "npx" };
}

function nextCheckoutTemplate({
  packageManager,
}: TemplateRenderOptions): Record<string, string> {
  return {
    ".env.example": [
      "CASPER_PRIVATE_KEY_PEM=",
      "CASPER_PRIVATE_KEY_HEX=",
      "CASPER_NETWORK=casper:testnet",
      "NEXT_PUBLIC_CASTAI_RESOURCE_URL=https://api.example.com/protected",
      "NEXT_PUBLIC_CASTAI_RECIPIENT=",
      "",
    ].join("\n"),
    "README.md": [
      "# castAI Next Checkout",
      "",
      "Server route owns the Casper signer. Browser UI calls that route.",
      "",
      "```sh",
      installCommand(packageManager),
      `${packageManager === "npm" ? "npm run" : packageManager} dev`,
      "```",
      "",
    ].join("\n"),
    "app/api/castai/x402/route.ts": `import { createCasperX402Fetch } from "@castaisdk/ai-sdk";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as {
    init?: RequestInit;
    url: string;
  };

  const x402Fetch = createCasperX402Fetch({
    keyAlgorithm:
      process.env.CASPER_KEY_ALGORITHM === "secp256k1"
        ? "secp256k1"
        : "ed25519",
    networks: [
      process.env.CASPER_NETWORK === "casper:mainnet"
        ? "casper:mainnet"
        : "casper:testnet",
    ],
    privateKeyHex: process.env.CASPER_PRIVATE_KEY_HEX,
    privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
  });

  return x402Fetch(payload.url, payload.init);
}
`,
    "app/page.tsx": `"use client";

import type { FetchLike } from "@castaisdk/ai-sdk";
import { CastaiCheckout } from "@castaisdk/ai-sdk/react";

const resourceUrl =
  process.env.NEXT_PUBLIC_CASTAI_RESOURCE_URL ??
  "https://api.example.com/protected";

const serverX402Fetch: FetchLike = (input, init) =>
  fetch("/api/castai/x402", {
    body: JSON.stringify({
      init: {
        body: typeof init?.body === "string" ? init.body : undefined,
        headers: headersToRecord(init?.headers),
        method: init?.method,
      },
      url: String(input),
    }),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });

export default function Page() {
  return (
    <main style={{ margin: "48px auto", maxWidth: 760, padding: 24 }}>
      <CastaiCheckout
        amount="0.001"
        network="casper:testnet"
        recipient={process.env.NEXT_PUBLIC_CASTAI_RECIPIENT}
        request={{ url: resourceUrl }}
        scheme="x402"
        x402Fetch={serverX402Fetch}
      />
    </main>
  );
}

function headersToRecord(headers: HeadersInit | undefined) {
  if (!headers) return undefined;
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers;
}
`,
    "next.config.mjs": `/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
};

export default config;
`,
    "package.json": JSON.stringify(
      {
        dependencies: {
          "@castaisdk/ai-sdk": "latest",
          next: "latest",
          react: "latest",
          "react-dom": "latest",
        },
        devDependencies: {
          "@types/node": "latest",
          "@types/react": "latest",
          "@types/react-dom": "latest",
          typescript: "latest",
        },
        private: true,
        scripts: {
          build: "next build",
          dev: "next dev",
          start: "next start",
          typecheck: "tsc --noEmit",
        },
        type: "module",
      },
      null,
      2
    ),
    "tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          esModuleInterop: true,
          isolatedModules: true,
          jsx: "preserve",
          lib: ["dom", "dom.iterable", "es2022"],
          module: "esnext",
          moduleResolution: "bundler",
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "es2022",
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
      },
      null,
      2
    ),
  };
}

function agentVercelAiTemplate({
  packageManager,
}: TemplateRenderOptions): Record<string, string> {
  return {
    ".env.example": [
      "OPENAI_API_KEY=",
      "CASPER_PRIVATE_KEY_PEM=",
      "CASPER_PRIVATE_KEY_HEX=",
      "CASTAI_PAID_RESOURCE_URL=https://api.example.com/protected",
      "",
    ].join("\n"),
    "README.md": [
      "# castAI Vercel AI Agent",
      "",
      "```sh",
      installCommand(packageManager),
      `${packageManager === "npm" ? "npm run" : packageManager} dev`,
      "```",
      "",
    ].join("\n"),
    "package.json": JSON.stringify(
      {
        dependencies: {
          "@ai-sdk/openai": "latest",
          "@castaisdk/ai-sdk": "latest",
          ai: "latest",
          dotenv: "latest",
        },
        devDependencies: {
          "@types/node": "latest",
          tsx: "latest",
          typescript: "latest",
        },
        private: true,
        scripts: {
          dev: "tsx src/index.ts",
          typecheck: "tsc --noEmit",
        },
        type: "module",
      },
      null,
      2
    ),
    "src/index.ts": `import "dotenv/config";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import {
  createCasperMppFetch,
  createCasperX402Fetch,
} from "@castaisdk/ai-sdk";
import { createCastaiVercelAITools } from "@castaisdk/ai-sdk/adapters/vercel-ai";

const x402Fetch = createCasperX402Fetch({
  networks: ["casper:testnet"],
  privateKeyHex: process.env.CASPER_PRIVATE_KEY_HEX,
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});

const mppFetch = createCasperMppFetch({
  network: "casper:testnet",
  privateKeyHex: process.env.CASPER_PRIVATE_KEY_HEX,
  privateKeyPem: process.env.CASPER_PRIVATE_KEY_PEM,
});

const result = await generateText({
  model: openai("gpt-4.1-mini"),
  prompt: \`Fetch this paid resource and summarize it: \${process.env.CASTAI_PAID_RESOURCE_URL}\`,
  tools: createCastaiVercelAITools({
    mpp: { fetch: mppFetch },
    x402: { fetch: x402Fetch },
  }),
});

console.log(result.text);
`,
    "tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          esModuleInterop: true,
          lib: ["es2022", "dom"],
          module: "esnext",
          moduleResolution: "bundler",
          noEmit: true,
          skipLibCheck: true,
          strict: true,
          target: "es2022",
        },
        include: ["src/**/*.ts"],
      },
      null,
      2
    ),
  };
}

function mcpClaudeCodeTemplate({
  packageManager,
}: TemplateRenderOptions): Record<string, string> {
  return {
    ".mcp.json": `${JSON.stringify(createMcpConfig({ packageManager }), null, 2)}\n`,
    "README.md": [
      "# castAI Claude Code MCP",
      "",
      "Set one signer environment variable before starting Claude Code:",
      "",
      "```sh",
      "export CASPER_PRIVATE_KEY_PEM=...",
      "export CASPER_NETWORK=casper:testnet",
      "```",
      "",
      "Available MCP tools:",
      "",
      "- `castai_doctor`",
      "- `castai_pay_x402_resource`",
      "- `castai_pay_mpp_resource`",
      "- `castai_format_paid_resource`",
      "",
    ].join("\n"),
  };
}
