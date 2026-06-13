"use client";

import type { PaymentScheme } from "@castai/ai-sdk";
import { CastaiCheckout } from "@castai/ai-sdk/react";

type CheckoutStoryViewProps = {
  amount: string;
  description: string;
  network: "casper:mainnet" | "casper:testnet";
  recipient: string;
  resourceUrl: string;
  scheme: PaymentScheme;
  title: string;
};

const explainOnlyFetch = async (): Promise<Response> => {
  throw new Error("Connect a server payment fetcher to submit this checkout.");
};

export function CheckoutStoryView({
  amount,
  description,
  network,
  recipient,
  resourceUrl,
  scheme,
  title,
}: CheckoutStoryViewProps) {
  return (
    <div className="checkout-story-frame">
      <CastaiCheckout
        actionLabel={`Pay ${amount} CSPR`}
        amount={amount}
        description={description}
        mppFetch={scheme === "mpp" ? explainOnlyFetch : undefined}
        network={network}
        recipient={recipient}
        request={{
          url: resourceUrl,
        }}
        scheme={scheme}
        showResponse={false}
        title={title}
        x402Fetch={scheme === "x402" ? explainOnlyFetch : undefined}
      />
    </div>
  );
}
