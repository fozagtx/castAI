import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { trimTrailingSlash } from "hono/trailing-slash";

import type { Env } from "./env";
import { internalServerError } from "./errors";
import { routeHandler } from "./handlers/route";
import { x402ClientMiddleware } from "./middlewares/x402-client";
import { x402ServerMiddleware } from "./middlewares/x402-server";

const app = new Hono<Env>();

app.use(logger()).use(trimTrailingSlash()).use(cors());

app.get("/", (c) =>
  c.json({
    title: "castAI — Casper x402 payment router",
    availableEndpoints: ["/route/x402 - Route x402 payments"],
  })
);

app
  .use(x402ServerMiddleware())
  .use(x402ClientMiddleware())
  .route("/route", routeHandler);

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  console.error(err);
  return c.json(internalServerError, 500);
});

export default app;
