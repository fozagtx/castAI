import type { Method } from "mppx";

import { charge as charge_ } from "./Charge.js";

export function casper(
  parameters?: casper.Parameters
): readonly [Method.AnyServer] {
  return [casper.charge(parameters)] as const;
}

export namespace casper {
  export type Parameters = charge_.Parameters;

  export const charge = charge_;
}
