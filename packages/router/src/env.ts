import type { X402ClientVariables } from "./middlewares/x402-client";
import type { X402ServerVariables } from "./middlewares/x402-server";

export type Variables = X402ClientVariables & X402ServerVariables;

export interface Env {
  Bindings: CloudflareBindings;
  Variables: Variables;
}
