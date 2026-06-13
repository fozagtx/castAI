"use client";

import type { PaymentScheme } from "@castaisdk/ai-sdk";
import { CastaiCheckoutHeadless } from "@castaisdk/ai-sdk/react";

type HeadlessCheckoutStoryViewProps = {
  resourceUrl: string;
  scheme: PaymentScheme;
};

const blockedFetch = async (): Promise<Response> => {
  throw new Error("Connect a server payment fetcher to submit this checkout.");
};

export function HeadlessCheckoutStoryView({
  resourceUrl,
  scheme,
}: HeadlessCheckoutStoryViewProps) {
  return (
    <div className="checkout-story-frame">
      <CastaiCheckoutHeadless
        mppFetch={scheme === "mpp" ? blockedFetch : undefined}
        request={{ url: resourceUrl }}
        scheme={scheme}
        x402Fetch={scheme === "x402" ? blockedFetch : undefined}
      >
        {({ canSubmit, error, reset, result, submit }) => (
          <section className="headless-story-panel">
            <div className="headless-story-panel__header">
              <span>Headless state</span>
              <strong>
                {error ? "setup required" : result ? "paid" : "ready"}
              </strong>
            </div>
            <dl className="headless-story-panel__meta">
              <div>
                <dt>Scheme</dt>
                <dd>{scheme}</dd>
              </div>
              <div>
                <dt>canSubmit</dt>
                <dd>{String(canSubmit)}</dd>
              </div>
              <div>
                <dt>Resource</dt>
                <dd>{resourceUrl}</dd>
              </div>
            </dl>
            {error ? <p>{error.message}</p> : null}
            <div className="headless-story-panel__actions">
              <button
                onClick={() => submit().catch(() => undefined)}
                type="button"
              >
                Submit
              </button>
              <button onClick={reset} type="button">
                Reset
              </button>
            </div>
          </section>
        )}
      </CastaiCheckoutHeadless>
    </div>
  );
}
