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

export type CastaiAgentKitAction = {
  description: string;
  invoke: (
    walletProvider: unknown,
    args: AgentResourceRequest
  ) => Promise<string>;
  name: CastaiAdapterToolName;
  schema: ReturnType<
    typeof createCastaiAdapterActionList
  >[number]["inputSchema"];
};

export type CastaiAgentKitActionProvider = {
  getActions: () => CastaiAgentKitAction[];
  name: "castai";
  supportsNetwork: () => boolean;
};

export function createCastaiAgentKitActionProvider(
  options: CreateCastaiAgentToolsOptions & {
    text?: LlmTextOptions | undefined;
  }
): CastaiAgentKitActionProvider {
  const actions = createCastaiAdapterActionList(options);

  return {
    getActions: () =>
      actions.map((action) => ({
        description: action.description,
        invoke: async (_walletProvider, args) =>
          action.text(parseCastaiResourceRequest(args), options.text),
        name: action.name,
        schema: action.inputSchema,
      })),
    name: "castai",
    supportsNetwork: () => true,
  };
}
