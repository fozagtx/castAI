import type {
  AgentResourceRequest,
  CreateCastaiAgentToolsOptions,
  LlmTextOptions,
} from "../index.js";
import type { CastaiAdapterToolName } from "./shared.js";
import {
  createCastaiAdapterActionList,
  parseCastaiResourceRequest,
} from "./shared.js";

export type CastaiLangChainToolDefinition = {
  description: string;
  func: (input: AgentResourceRequest | string) => Promise<string>;
  name: CastaiAdapterToolName;
  schema: ReturnType<
    typeof createCastaiAdapterActionList
  >[number]["inputSchema"];
};

export type CastaiLangChainToolFactory<TTool> = (
  handler: (input: AgentResourceRequest) => Promise<string>,
  config: {
    description: string;
    name: CastaiAdapterToolName;
    schema: CastaiLangChainToolDefinition["schema"];
  }
) => TTool;

export function createCastaiLangChainTools(
  options: CreateCastaiAgentToolsOptions & {
    text?: LlmTextOptions | undefined;
  }
): CastaiLangChainToolDefinition[];

export function createCastaiLangChainTools<TTool>(
  options: CreateCastaiAgentToolsOptions & {
    text?: LlmTextOptions | undefined;
    toolFactory: CastaiLangChainToolFactory<TTool>;
  }
): TTool[];

export function createCastaiLangChainTools<TTool>(
  options: CreateCastaiAgentToolsOptions & {
    text?: LlmTextOptions | undefined;
    toolFactory?: CastaiLangChainToolFactory<TTool> | undefined;
  }
): CastaiLangChainToolDefinition[] | TTool[] {
  const actions = createCastaiAdapterActionList(options);

  if (options.toolFactory) {
    const factory = options.toolFactory;
    return actions.map((action) => {
      const handler = async (input: AgentResourceRequest) =>
        action.text(parseCastaiResourceRequest(input), options.text);

      return factory(handler, {
        description: action.description,
        name: action.name,
        schema: action.inputSchema,
      });
    });
  }

  return actions.map((action) => {
    const handler = async (input: AgentResourceRequest | string) =>
      action.text(parseCastaiResourceRequest(input), options.text);
    return {
      description: action.description,
      func: handler,
      name: action.name,
      schema: action.inputSchema,
    };
  });
}
