import type { Method } from "mppx";

import { charge as charge_ } from "./Charge.js";

export function casper(
  parameters: casper.Parameters = {}
): readonly [Method.AnyClient] {
  return [charge_(parameters)] as const;
}

export namespace casper {
  export type Parameters = charge_.Parameters;

  export const charge = charge_;
}
