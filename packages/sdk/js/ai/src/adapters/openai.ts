import type {
  AgentResourceRequest,
  AgentResourceResponse,
  CreateCastaiAgentToolsOptions,
  LlmTextOptions,
} from "../index.js";
import type { castaiResourceRequestJsonSchema } from "./shared.js";
import {
  createCastaiAdapterActionList,
  parseCastaiResourceRequest,
} from "./shared.js";

export type CastaiOpenAITool = {
  description: string;
  name: string;
  parameters: typeof castaiResourceRequestJsonSchema;
  strict: false;
  type: "function";
};

export type CastaiOpenAIChatTool = {
  function: {
    description: string;
    name: string;
    parameters: typeof castaiResourceRequestJsonSchema;
  };
  type: "function";
};

export type CastaiOpenAIToolCall =
  | {
      function?: {
        arguments?: string | undefined;
        name?: string | undefined;
      };
      name?: string | undefined;
      arguments?: string | Record<string, unknown> | undefined;
    }
  | {
      type?: string | undefined;
      name?: string | undefined;
      input?: unknown;
    };

export type CastaiOpenAITools = {
  chatTools: CastaiOpenAIChatTool[];
  executeToolCall: (
    toolCall: CastaiOpenAIToolCall
  ) => Promise<AgentResourceResponse>;
  executeToolCallText: (
    toolCall: CastaiOpenAIToolCall,
    options?: LlmTextOptions | undefined
  ) => Promise<string>;
  tools: CastaiOpenAITool[];
};

export function createCastaiOpenAITools(
  options: CreateCastaiAgentToolsOptions
): CastaiOpenAITools {
  const actions = createCastaiAdapterActionList(options);

  async function executeToolCall(toolCall: CastaiOpenAIToolCall) {
    const { input, name } = parseOpenAIToolCall(toolCall);
    const action = actions.find((candidate) => candidate.name === name);
    if (!action) throw new Error(`Unknown castAI tool call: ${name}`);
    return action.execute(input);
  }

  async function executeToolCallText(
    toolCall: CastaiOpenAIToolCall,
    textOptions?: LlmTextOptions | undefined
  ) {
    const { input, name } = parseOpenAIToolCall(toolCall);
    const action = actions.find((candidate) => candidate.name === name);
    if (!action) throw new Error(`Unknown castAI tool call: ${name}`);
    return action.text(input, textOptions);
  }

  return {
    chatTools: actions.map((action) => ({
      function: {
        description: action.description,
        name: action.name,
        parameters: action.jsonSchema,
      },
      type: "function",
    })),
    executeToolCall,
    executeToolCallText,
    tools: actions.map((action) => ({
      description: action.description,
      name: action.name,
      parameters: action.jsonSchema,
      strict: false,
      type: "function",
    })),
  };
}

function parseOpenAIToolCall(toolCall: CastaiOpenAIToolCall): {
  input: AgentResourceRequest;
  name: string;
} {
  if ("function" in toolCall && toolCall.function) {
    return {
      input: parseCastaiResourceRequest(toolCall.function.arguments ?? "{}"),
      name: toolCall.function.name ?? "",
    };
  }

  if ("input" in toolCall) {
    return {
      input: parseCastaiResourceRequest(toolCall.input),
      name: toolCall.name ?? "",
    };
  }

  const genericToolCall = toolCall as {
    arguments?: string | Record<string, unknown> | undefined;
    name?: string | undefined;
  };

  return {
    input: parseCastaiResourceRequest(genericToolCall.arguments ?? "{}"),
    name: genericToolCall.name ?? "",
  };
}
