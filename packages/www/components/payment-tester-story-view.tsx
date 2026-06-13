"use client";

import type { PaymentScheme } from "@castaisdk/ai-sdk";
import { PaymentTester } from "@castaisdk/ai-sdk/react";

type PaymentTesterStoryViewProps = {
  defaultHeaders: string;
  defaultScheme: PaymentScheme;
  defaultUrl: string;
  title: string;
};

const blockedFetch = async (): Promise<Response> => {
  throw new Error("Connect a server payment fetcher to submit this request.");
};

export function PaymentTesterStoryView({
  defaultHeaders,
  defaultScheme,
  defaultUrl,
  title,
}: PaymentTesterStoryViewProps) {
  return (
    <div className="checkout-story-frame">
      <PaymentTester
        defaultHeaders={defaultHeaders}
        defaultScheme={defaultScheme}
        defaultUrl={defaultUrl}
        mppFetch={blockedFetch}
        title={title}
        x402Fetch={blockedFetch}
      />
    </div>
  );
}
