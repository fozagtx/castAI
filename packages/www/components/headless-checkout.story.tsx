import { defineStory } from "@/lib/story";

import { HeadlessCheckoutStoryView } from "./headless-checkout-story-view";

export const headlessCheckoutStory = defineStory({
  Component: HeadlessCheckoutStoryView,
  displayName: "CastaiCheckoutHeadless",
  args: [
    {
      variant: "x402",
      initial: {
        resourceUrl: "https://api.example.com/protected",
        scheme: "x402",
      },
    },
    {
      variant: "MPP",
      initial: {
        resourceUrl: "https://api.example.com/protected",
        scheme: "mpp",
      },
    },
  ],
});
