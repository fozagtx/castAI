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

export type CastaiGoatTool = {
  description: string;
  execute: (args: AgentResourceRequest) => Promise<string>;
  name: CastaiAdapterToolName;
  parameters: ReturnType<
    typeof createCastaiAdapterActionList
  >[number]["inputSchema"];
};

export type CastaiGoatPlugin = {
  getTools: () => CastaiGoatTool[];
  name: "castai";
  supportsChain: () => boolean;
};

export function createCastaiGoatPlugin(
  options: CreateCastaiAgentToolsOptions & {
    text?: LlmTextOptions | undefined;
  }
): CastaiGoatPlugin {
  const actions = createCastaiAdapterActionList(options);

  return {
    getTools: () =>
      actions.map((action) => ({
        description: action.description,
        execute: async (args) =>
          action.text(parseCastaiResourceRequest(args), options.text),
        name: action.name,
        parameters: action.inputSchema,
      })),
    name: "castai",
    supportsChain: () => true,
  };
}
