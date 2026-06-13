import { defineStory } from "@/lib/story";

import { CheckoutStoryView } from "./checkout-story-view";

export const checkoutStory = defineStory({
  Component: CheckoutStoryView,
  displayName: "CastaiCheckout",
  args: [
    {
      variant: "x402",
      initial: {
        amount: "0.001",
        description:
          "Render a focused checkout panel for one protected HTTP resource.",
        network: "casper:testnet",
        recipient: "Configured recipient",
        resourceUrl: "https://api.example.com/protected",
        scheme: "x402",
        title: "castAI x402 checkout",
      },
    },
    {
      variant: "MPP",
      initial: {
        amount: "0.001",
        description:
          "Render the same checkout surface with the MPP payment path selected.",
        network: "casper:testnet",
        recipient: "Configured recipient",
        resourceUrl: "https://api.example.com/protected",
        scheme: "mpp",
        title: "castAI MPP checkout",
      },
    },
  ],
});
