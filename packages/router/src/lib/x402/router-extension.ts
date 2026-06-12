import type { ResourceServerExtension, SettleResponse } from "@x402/core/types";

export const ROUTER_EXTENSION = "castai-router";

export type RouterExtensionDeclaration = {
  url: string;
};

export type TransportContext = {
  responseHeaders: {
    "payment-response": string;
  };
};

export const createRouterExtension = (): ResourceServerExtension => ({
  key: ROUTER_EXTENSION,

  enrichSettlementResponse: async (declaration, context) => {
    const { url } = declaration as RouterExtensionDeclaration;
    const { responseHeaders } = context.transportContext as TransportContext;

    if (!responseHeaders?.["payment-response"]) return;

    const paymentResponse = responseHeaders["payment-response"];
    const settlement = JSON.parse(atob(paymentResponse)) as SettleResponse;

    return { url, settlement };
  },
});

export const declareRouterExtension = (
  declaration: RouterExtensionDeclaration
) => {
  return {
    [ROUTER_EXTENSION]: declaration,
  };
};
