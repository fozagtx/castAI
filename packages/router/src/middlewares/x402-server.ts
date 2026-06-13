import {
  HTTPFacilitatorClient,
  x402ResourceServer as X402Server,
} from "@x402/core/server";
import { createMiddleware } from "hono/factory";

import { registerExactCasperScheme } from "@castaisdk/x402/server";

import type { Env } from "../env";
import { SUPPORTED_NETWORKS } from "../config/chains";
import { createRouterExtension } from "../lib/x402/router-extension";

export type X402ServerVariables = {
  X402_SERVER: X402Server;
};

export const x402ServerMiddleware = () =>
  createMiddleware<Env>(async (c, next) => {
    const facilitatorClient = new HTTPFacilitatorClient({
      url: c.env.FACILITATOR_URL,
    });
    const x402Server = new X402Server(facilitatorClient);

    registerExactCasperScheme(x402Server, {
      networks: [...SUPPORTED_NETWORKS],
    });

    x402Server.registerExtension(createRouterExtension());

    c.set("X402_SERVER", x402Server);

    return next();
  });
