import { defineStory } from "@/lib/story";

import { PaymentTesterStoryView } from "./payment-tester-story-view";

export const paymentTesterStory = defineStory({
  Component: PaymentTesterStoryView,
  displayName: "PaymentTester",
  args: [
    {
      variant: "x402",
      initial: {
        defaultHeaders: '{"accept":"application/json"}',
        defaultScheme: "x402",
        defaultUrl: "https://api.example.com/protected",
        title: "castAI payment tester",
      },
    },
    {
      variant: "MPP",
      initial: {
        defaultHeaders: '{"accept":"application/json"}',
        defaultScheme: "mpp",
        defaultUrl: "https://api.example.com/protected",
        title: "castAI MPP payment tester",
      },
    },
  ],
});
