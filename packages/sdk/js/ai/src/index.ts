import { x402Client } from "@x402/core/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import { tool } from "ai";
import { Mppx } from "mppx/client";
import { z } from "zod";

import type { casper as mppCasper } from "@castai/mpp/client";
import type { CasperSignerOptions } from "@castai/x402/client";
import { casper } from "@castai/mpp/client";
import { registerExactCasperClientScheme } from "@castai/x402/client";

export type PaymentScheme = "x402" | "mpp";

export type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>;

export type AgentResourceRequest = {
  body?: string | undefined;
  headers?: Record<string, string> | undefined;
  method?: string | undefined;
  url: string;
};

export type AgentResourceResponse = {
  body: unknown;
  contentType: string | null;
  headers: Record<string, string>;
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
};

export type CreateX402FetchOptions = CasperSignerOptions & {
  fetch?: FetchLike | undefined;
  networks?: ("casper:mainnet" | "casper:testnet")[] | undefined;
};

export type CreateMppFetchOptions = mppCasper.Parameters & {
  fetch?: FetchLike | undefined;
};

export type CreateCastaiAgentToolsOptions = {
  mpp?: {
    fetch?: FetchLike | undefined;
  };
  x402?: {
    fetch?: FetchLike | undefined;
  };
};

const requestSchema = z.object({
  body: z.string().optional().describe("Optional raw request body."),
  headers: z
    .record(z.string(), z.string())
    .optional()
    .describe("Optional request headers."),
  method: z
    .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
    .optional()
    .describe("HTTP method. Defaults to GET."),
  url: z.url().describe("HTTP resource URL to request."),
});

export function createCasperX402Fetch(
  options: CreateX402FetchOptions
): FetchLike {
  const client = new x402Client();

  registerExactCasperClientScheme(client, {
    ...options,
    networks: options.networks ?? ["casper:testnet"],
  });

  return wrapFetchWithPayment(options.fetch ?? fetch, client) as FetchLike;
}

export function createCasperMppFetch(
  options: CreateMppFetchOptions
): FetchLike {
  const client = Mppx.create({
    methods: [casper(options)],
  });

  return client.fetch.bind(client) as FetchLike;
}

export function createCastaiAgentTools(options: CreateCastaiAgentToolsOptions) {
  return {
    payX402Resource: tool({
      description:
        "Request an HTTP x402 resource and pay with configured Casper CSPR payment credentials.",
      inputSchema: requestSchema,
      execute: async (request) => {
        if (!options.x402?.fetch) {
          throw new Error("x402 fetch is not configured for this agent.");
        }

        return fetchResource(options.x402.fetch, request);
      },
    }),

    payMppResource: tool({
      description:
        "Request an MPP-protected HTTP resource and pay with configured Casper CSPR payment credentials.",
      inputSchema: requestSchema,
      execute: async (request) => {
        if (!options.mpp?.fetch) {
          throw new Error("MPP fetch is not configured for this agent.");
        }

        return fetchResource(options.mpp.fetch, request);
      },
    }),
  };
}

export async function fetchResource(
  paymentFetch: FetchLike,
  request: AgentResourceRequest
): Promise<AgentResourceResponse> {
  const response = await paymentFetch(request.url, {
    body: request.body,
    headers: request.headers,
    method: request.method ?? "GET",
  });

  return readResponse(response, request.url);
}

async function readResponse(
  response: Response,
  fallbackUrl: string
): Promise<AgentResourceResponse> {
  const contentType = response.headers.get("content-type");
  const bodyText = await response.text();

  return {
    body: parseBody(bodyText, contentType),
    contentType,
    headers: Object.fromEntries(response.headers.entries()),
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    url: response.url || fallbackUrl,
  };
}

function parseBody(body: string, contentType: string | null): unknown {
  if (!body) return null;
  if (!contentType?.includes("application/json")) return body;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}
