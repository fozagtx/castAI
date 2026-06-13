import type { x402Facilitator } from "@x402/core/facilitator";

import { registerExactCasperFacilitatorScheme } from "@castaisdk/x402/facilitator";

import type { CasperNetwork } from "../chains/casper";

export const registerCasperExactScheme = (
  facilitator: x402Facilitator,
  networks: CasperNetwork[],
  rpcUrls: Partial<Record<CasperNetwork, string>>,
  signers: string[]
) => {
  registerExactCasperFacilitatorScheme(facilitator, {
    networks,
    rpcUrls,
    signers,
  });
};
