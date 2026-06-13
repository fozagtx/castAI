import type { ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import type {
  AgentResourceRequest,
  AgentResourceResponse,
  CreateMppFetchOptions,
  CreateX402FetchOptions,
  FetchLike,
} from "@castaisdk/ai-sdk";
import {
  castaiResourceRequestSchema,
  createCasperMppFetch,
  createCasperX402Fetch,
  fetchResource,
  paidResourceResponseToText,
} from "@castaisdk/ai-sdk";

export type CastaiMcpFetches = {
  mpp?: FetchLike | undefined;
  x402?: FetchLike | undefined;
};

export type CastaiMcpServerOptions = {
  env?: Record<string, string | undefined> | undefined;
  fetches?: CastaiMcpFetches | undefined;
  name?: string | undefined;
  version?: string | undefined;
};

export type CastaiMcpDoctor = {
  mppConfigured: boolean;
  network: string;
  signerConfigured: boolean;
  x402Configured: boolean;
};

const VERSION = "0.0.1";

const resourceTextSchema = castaiResourceRequestSchema.extend({
  includeHeaders: z.boolean().optional(),
  maxBodyCharacters: z.number().int().positive().max(200_000).optional(),
});

const responseTextSchema = z.object({
  response: z.custom<AgentResourceResponse>((value) => {
    return Boolean(value && typeof value === "object" && "status" in value);
  }),
  includeHeaders: z.boolean().optional(),
  maxBodyCharacters: z.number().int().positive().max(200_000).optional(),
});

function mcpInputSchema(shape: Record<string, unknown>) {
  return shape as unknown as ZodRawShapeCompat;
}

export function createCastaiMcpServer(
  options: CastaiMcpServerOptions = {}
): McpServer {
  const env = options.env ?? process.env;
  const fetches = options.fetches ?? createCastaiMcpFetchesFromEnv(env);
  const doctor = createCastaiMcpDoctor(env, fetches);
  const server = new McpServer({
    name: options.name ?? "castai-mcp",
    version: options.version ?? VERSION,
  });

  server.registerTool(
    "castai_doctor",
    {
      description:
        "Report whether castAI MCP payment fetchers are configured from environment.",
      inputSchema: {},
      title: "castAI doctor",
    },
    async () => textResult(JSON.stringify(doctor, null, 2), doctor)
  );

  server.registerTool(
    "castai_pay_x402_resource",
    {
      description:
        "Request an HTTP x402 resource with configured Casper CSPR payment credentials.",
      inputSchema: mcpInputSchema(resourceTextSchema.shape),
      title: "Pay x402 resource",
    },
    async (input) =>
      paidResourceTool(fetches.x402, "x402", resourceTextSchema.parse(input))
  );

  server.registerTool(
    "castai_pay_mpp_resource",
    {
      description:
        "Request an MPP-protected HTTP resource with configured Casper CSPR payment credentials.",
      inputSchema: mcpInputSchema(resourceTextSchema.shape),
      title: "Pay MPP resource",
    },
    async (input) =>
      paidResourceTool(fetches.mpp, "MPP", resourceTextSchema.parse(input))
  );

  server.registerTool(
    "castai_format_paid_resource",
    {
      description: "Format a paid resource response for use in an LLM answer.",
      inputSchema: mcpInputSchema(responseTextSchema.shape),
      title: "Format paid resource",
    },
    async (input) => {
      const { includeHeaders, maxBodyCharacters, response } =
        responseTextSchema.parse(input);

      return textResult(
        paidResourceResponseToText(response, {
          includeHeaders,
          maxBodyCharacters,
        })
      );
    }
  );

  return server;
}

export function createCastaiMcpFetchesFromEnv(
  env: Record<string, string | undefined>
): CastaiMcpFetches {
  const signer = readSignerEnv(env);
  if (!signer.privateKeyHex && !signer.privateKeyPem) return {};

  const network = readNetworkEnv(env);
  const keyAlgorithm = readKeyAlgorithmEnv(env);
  const publicKey = env.CASTAI_CASPER_PUBLIC_KEY ?? env.CASPER_PUBLIC_KEY;
  const x402Options = {
    keyAlgorithm,
    networks: [network],
    privateKeyHex: signer.privateKeyHex,
    privateKeyPem: signer.privateKeyPem,
    publicKey,
  } satisfies CreateX402FetchOptions;
  const mppOptions = {
    keyAlgorithm,
    network,
    privateKeyHex: signer.privateKeyHex,
    privateKeyPem: signer.privateKeyPem,
    publicKey,
  } satisfies CreateMppFetchOptions;

  return {
    mpp: createCasperMppFetch(mppOptions),
    x402: createCasperX402Fetch(x402Options),
  };
}

export function createCastaiMcpDoctor(
  env: Record<string, string | undefined>,
  fetches: CastaiMcpFetches = createCastaiMcpFetchesFromEnv(env)
): CastaiMcpDoctor {
  const signer = readSignerEnv(env);

  return {
    mppConfigured: Boolean(fetches.mpp),
    network: readNetworkEnv(env),
    signerConfigured: Boolean(signer.privateKeyHex || signer.privateKeyPem),
    x402Configured: Boolean(fetches.x402),
  };
}

async function paidResourceTool(
  paymentFetch: FetchLike | undefined,
  label: string,
  input: z.infer<typeof resourceTextSchema>
) {
  if (!paymentFetch) {
    throw new Error(`${label} fetch is not configured.`);
  }

  const { includeHeaders, maxBodyCharacters, ...request } = input;
  const response = await fetchResource(
    paymentFetch,
    request satisfies AgentResourceRequest
  );

  return textResult(
    paidResourceResponseToText(response, {
      includeHeaders,
      maxBodyCharacters,
    }),
    response
  );
}

function textResult(text: string, structuredContent?: unknown) {
  return {
    content: [
      {
        text,
        type: "text" as const,
      },
    ],
    structuredContent:
      structuredContent && typeof structuredContent === "object"
        ? (structuredContent as Record<string, unknown>)
        : undefined,
  };
}

function readSignerEnv(env: Record<string, string | undefined>) {
  return {
    privateKeyHex:
      env.CASTAI_CASPER_PRIVATE_KEY_HEX ??
      env.CASTAI_PRIVATE_KEY_HEX ??
      env.CASPER_PRIVATE_KEY_HEX,
    privateKeyPem:
      env.CASTAI_CASPER_PRIVATE_KEY_PEM ??
      env.CASTAI_PRIVATE_KEY_PEM ??
      env.CASPER_PRIVATE_KEY_PEM,
  };
}

function readNetworkEnv(
  env: Record<string, string | undefined>
): "casper:mainnet" | "casper:testnet" {
  const network = env.CASTAI_CASPER_NETWORK ?? env.CASPER_NETWORK;
  return network === "casper:mainnet" ? "casper:mainnet" : "casper:testnet";
}

function readKeyAlgorithmEnv(
  env: Record<string, string | undefined>
): "ed25519" | "secp256k1" | undefined {
  const algorithm = env.CASTAI_CASPER_KEY_ALGORITHM ?? env.CASPER_KEY_ALGORITHM;
  if (algorithm === "secp256k1") return "secp256k1";
  if (algorithm === "ed25519") return "ed25519";
  return undefined;
}
