import type { z } from "zod";

import type {
  AgentResourceRequest,
  AgentResourceResponse,
  CreateCastaiAgentToolsOptions,
  FetchLike,
  LlmTextOptions,
  PaymentScheme,
} from "../index.js";
import {
  castaiResourceRequestSchema,
  fetchResource,
  paidResourceResponseToText,
} from "../index.js";

export const castaiResourceRequestJsonSchema = {
  additionalProperties: false,
  properties: {
    body: {
      description: "Optional raw request body.",
      type: "string",
    },
    headers: {
      additionalProperties: {
        type: "string",
      },
      description: "Optional request headers.",
      type: "object",
    },
    method: {
      default: "GET",
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      type: "string",
    },
    url: {
      description: "HTTP resource URL to request.",
      format: "uri",
      type: "string",
    },
  },
  required: ["url"],
  type: "object",
} as const;

export type CastaiAdapterToolName = "payX402Resource" | "payMppResource";

export type CastaiAdapterAction = {
  description: string;
  execute: (request: AgentResourceRequest) => Promise<AgentResourceResponse>;
  inputSchema: typeof castaiResourceRequestSchema;
  jsonSchema: typeof castaiResourceRequestJsonSchema;
  name: CastaiAdapterToolName;
  scheme: PaymentScheme;
  text: (
    request: AgentResourceRequest,
    options?: LlmTextOptions | undefined
  ) => Promise<string>;
};

export type CastaiAdapterActionRecord = Record<
  CastaiAdapterToolName,
  CastaiAdapterAction
>;

export function createCastaiAdapterActions(
  options: CreateCastaiAgentToolsOptions
): CastaiAdapterActionRecord {
  return {
    payMppResource: createAction({
      description:
        "Request an MPP-protected HTTP resource and pay with configured Casper CSPR payment credentials.",
      getFetch: () => options.mpp?.fetch,
      missingMessage: "MPP fetch is not configured for this agent.",
      name: "payMppResource",
      scheme: "mpp",
    }),
    payX402Resource: createAction({
      description:
        "Request an HTTP x402 resource and pay with configured Casper CSPR payment credentials.",
      getFetch: () => options.x402?.fetch,
      missingMessage: "x402 fetch is not configured for this agent.",
      name: "payX402Resource",
      scheme: "x402",
    }),
  };
}

export function createCastaiAdapterActionList(
  options: CreateCastaiAgentToolsOptions
): CastaiAdapterAction[] {
  const actions = createCastaiAdapterActions(options);
  return [actions.payX402Resource, actions.payMppResource];
}

export function parseCastaiResourceRequest(
  input: unknown
): z.infer<typeof castaiResourceRequestSchema> {
  if (typeof input === "string") {
    return castaiResourceRequestSchema.parse(JSON.parse(input));
  }

  return castaiResourceRequestSchema.parse(input);
}

function createAction(options: {
  description: string;
  getFetch: () => FetchLike | undefined;
  missingMessage: string;
  name: CastaiAdapterToolName;
  scheme: PaymentScheme;
}): CastaiAdapterAction {
  return {
    description: options.description,
    execute: async (request) => {
      const paymentFetch = options.getFetch();
      if (!paymentFetch) throw new Error(options.missingMessage);
      return fetchResource(paymentFetch, request);
    },
    inputSchema: castaiResourceRequestSchema,
    jsonSchema: castaiResourceRequestJsonSchema,
    name: options.name,
    scheme: options.scheme,
    text: async (request, textOptions) => {
      const paymentFetch = options.getFetch();
      if (!paymentFetch) throw new Error(options.missingMessage);
      return paidResourceResponseToText(
        await fetchResource(paymentFetch, request),
        textOptions
      );
    },
  };
}
