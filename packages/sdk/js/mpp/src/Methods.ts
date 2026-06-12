import { Method, z } from "mppx";

import * as defaults from "./defaults.js";

export const charge = Method.from({
  name: "casper",
  intent: "charge",
  schema: {
    credential: {
      payload: z.discriminatedUnion("type", [
        z.object({
          type: z.literal("deployHash"),
          deployHash: z.string(),
          publicKey: z.optional(z.string()),
        }),
        z.object({
          type: z.literal("transactionHash"),
          transactionHash: z.string(),
          publicKey: z.optional(z.string()),
        }),
      ]),
    },
    request: z.pipe(
      z.object({
        amount: z.amount(),
        currency: z.optional(z.string()),
        decimals: z.optional(z.number()),
        description: z.optional(z.string()),
        externalId: z.optional(z.string()),
        network: z.optional(
          z.enum([defaults.network.mainnet, defaults.network.testnet])
        ),
        recipient: z.optional(z.string()),
      }),
      z.transform(({ amount, decimals, network, currency, ...rest }) => ({
        ...rest,
        amount: defaults.toMotes(amount, decimals ?? defaults.decimals),
        currency: currency ?? defaults.currency,
        ...(network !== undefined ? { methodDetails: { network } } : {}),
      }))
    ),
  },
});
