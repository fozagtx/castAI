"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import type {
  AgentResourceRequest,
  AgentResourceResponse,
  FetchLike,
  PaymentScheme,
} from "./index.js";
import { fetchResource } from "./index.js";

export type PaymentTesterProps = {
  defaultHeaders?: string | undefined;
  defaultScheme?: PaymentScheme | undefined;
  defaultUrl?: string | undefined;
  mppFetch?: FetchLike | undefined;
  onError?: ((error: Error) => void) | undefined;
  onResult?: ((result: AgentResourceResponse) => void) | undefined;
  title?: string | undefined;
  x402Fetch?: FetchLike | undefined;
};

export type CastaiCheckoutProps = {
  actionLabel?: string | undefined;
  amount?: string | undefined;
  asset?: string | undefined;
  cancelLabel?: string | undefined;
  description?: string | undefined;
  mppFetch?: FetchLike | undefined;
  network?: "casper:mainnet" | "casper:testnet" | undefined;
  onCancel?: (() => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
  onResult?: ((result: AgentResourceResponse) => void) | undefined;
  recipient?: string | undefined;
  request: AgentResourceRequest;
  scheme?: PaymentScheme | undefined;
  showResponse?: boolean | undefined;
  title?: string | undefined;
  x402Fetch?: FetchLike | undefined;
};

export type CastaiCheckoutContainer = Element | DocumentFragment | string;

export type RenderCastaiCheckoutOptions = CastaiCheckoutProps & {
  container: CastaiCheckoutContainer;
};

export type RenderedCastaiCheckout = {
  element: Element | DocumentFragment;
  unmount: () => void;
  update: (props: Partial<CastaiCheckoutProps>) => void;
};

export type CastaiCheckoutController = {
  mount: (
    container: CastaiCheckoutContainer
  ) => Promise<RenderedCastaiCheckout>;
  props: CastaiCheckoutProps;
};

const shellStyle = {
  background: "#0b0c0e",
  border: "1px solid rgba(148, 163, 184, 0.25)",
  borderRadius: 8,
  color: "#e2e8f0",
  display: "grid",
  gap: 14,
  maxWidth: 760,
  padding: 16,
} satisfies CSSProperties;

const mutedStyle = {
  color: "#94a3b8",
  fontSize: "0.85rem",
  lineHeight: 1.55,
  margin: 0,
} satisfies CSSProperties;

const metaGridStyle = {
  display: "grid",
  gap: 8,
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
} satisfies CSSProperties;

const metaItemStyle = {
  background: "#111318",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: 6,
  display: "grid",
  gap: 4,
  padding: 10,
} satisfies CSSProperties;

const inputStyle = {
  background: "#111318",
  border: "1px solid rgba(148, 163, 184, 0.28)",
  borderRadius: 6,
  color: "#f8fafc",
  font: "inherit",
  padding: "10px 12px",
  width: "100%",
} satisfies CSSProperties;

const rowStyle = {
  display: "grid",
  gap: 10,
  gridTemplateColumns: "140px minmax(0, 1fr)",
} satisfies CSSProperties;

const buttonStyle = {
  background: "#caa0ff",
  border: "1px solid #caa0ff",
  borderRadius: 6,
  color: "#0b0c0e",
  cursor: "pointer",
  fontWeight: 700,
  padding: "10px 12px",
} satisfies CSSProperties;

const secondaryButtonStyle = {
  background: "transparent",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  borderRadius: 6,
  color: "#e2e8f0",
  cursor: "pointer",
  fontWeight: 700,
  padding: "10px 12px",
} satisfies CSSProperties;

export function PaymentTester({
  defaultHeaders = "",
  defaultScheme = "x402",
  defaultUrl = "",
  mppFetch,
  onError,
  onResult,
  title = "castAI payment tester",
  x402Fetch,
}: PaymentTesterProps) {
  const [scheme, setScheme] = useState<PaymentScheme>(defaultScheme);
  const [url, setUrl] = useState(defaultUrl);
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState(defaultHeaders);
  const [body, setBody] = useState("");
  const [result, setResult] = useState<AgentResourceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedFetch = useMemo(() => {
    return scheme === "x402" ? x402Fetch : mppFetch;
  }, [mppFetch, scheme, x402Fetch]);

  async function submit() {
    setBusy(true);
    setError(null);

    try {
      if (!selectedFetch) {
        throw new Error(`${scheme} fetch is not configured.`);
      }

      const nextResult = await fetchResource(selectedFetch, {
        body: body || undefined,
        headers: parseHeaders(headers),
        method,
        url,
      });
      setResult(nextResult);
      onResult?.(nextResult);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Payment request failed.");
      setError(error.message);
      onError?.(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={shellStyle}>
      <h2
        style={{
          color: "#f8fafc",
          fontSize: "0.9rem",
          letterSpacing: "0.12em",
          margin: 0,
          textTransform: "uppercase",
        }}
      >
        {title}
      </h2>

      <label style={rowStyle}>
        <span>Scheme</span>
        <select
          onChange={(event) =>
            setScheme(event.currentTarget.value as PaymentScheme)
          }
          style={inputStyle}
          value={scheme}
        >
          <option value="x402">x402</option>
          <option value="mpp">MPP</option>
        </select>
      </label>

      <label style={rowStyle}>
        <span>URL</span>
        <input
          onChange={(event) => setUrl(event.currentTarget.value)}
          placeholder="https://api.example.com/protected"
          style={inputStyle}
          type="url"
          value={url}
        />
      </label>

      <label style={rowStyle}>
        <span>Method</span>
        <select
          onChange={(event) => setMethod(event.currentTarget.value)}
          style={inputStyle}
          value={method}
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>PATCH</option>
          <option>DELETE</option>
        </select>
      </label>

      <label style={{ display: "grid", gap: 8 }}>
        <span>Headers</span>
        <textarea
          onChange={(event) => setHeaders(event.currentTarget.value)}
          placeholder='Optional JSON object, for example {"accept":"application/json"}'
          rows={3}
          style={inputStyle}
          value={headers}
        />
      </label>

      <label style={{ display: "grid", gap: 8 }}>
        <span>Body</span>
        <textarea
          onChange={(event) => setBody(event.currentTarget.value)}
          placeholder="Optional raw body"
          rows={4}
          style={inputStyle}
          value={body}
        />
      </label>

      <button
        disabled={busy || !url}
        onClick={submit}
        style={buttonStyle}
        type="button"
      >
        {busy ? "Requesting..." : "Send paid request"}
      </button>

      {error ? <PaymentError message={error} /> : null}
      {result ? <PaymentResult result={result} /> : null}
    </section>
  );
}

export function CastaiCheckout({
  actionLabel = "Pay with Casper",
  amount,
  asset = "CSPR",
  cancelLabel = "Cancel",
  description = "Complete the payment to unlock this resource.",
  mppFetch,
  network,
  onCancel,
  onError,
  onResult,
  recipient,
  request,
  scheme = "x402",
  showResponse = true,
  title = "castAI checkout",
  x402Fetch,
}: CastaiCheckoutProps) {
  const [result, setResult] = useState<AgentResourceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedFetch = useMemo(() => {
    return scheme === "x402" ? x402Fetch : mppFetch;
  }, [mppFetch, scheme, x402Fetch]);

  async function submit() {
    setBusy(true);
    setError(null);

    try {
      if (!selectedFetch) {
        throw new Error(`${scheme} fetch is not configured.`);
      }

      const nextResult = await fetchResource(selectedFetch, request);
      setResult(nextResult);
      onResult?.(nextResult);
    } catch (err) {
      const nextError =
        err instanceof Error ? err : new Error("Checkout request failed.");
      setError(nextError.message);
      onError?.(nextError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-busy={busy} style={shellStyle}>
      <div style={{ display: "grid", gap: 8 }}>
        <h2
          style={{
            color: "#f8fafc",
            fontSize: "0.95rem",
            letterSpacing: "0.08em",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          {title}
        </h2>
        <p style={mutedStyle}>{description}</p>
      </div>

      <div style={metaGridStyle}>
        <CheckoutMeta label="Scheme" value={scheme} />
        {network ? <CheckoutMeta label="Network" value={network} /> : null}
        {amount ? (
          <CheckoutMeta label="Amount" value={`${amount} ${asset}`} />
        ) : null}
        {recipient ? (
          <CheckoutMeta label="Recipient" value={recipient} />
        ) : null}
      </div>

      <div style={metaItemStyle}>
        <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>Resource</span>
        <code
          style={{
            color: "#f8fafc",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "0.82rem",
            overflowWrap: "anywhere",
          }}
        >
          {request.method ?? "GET"} {request.url}
        </code>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button
          disabled={busy || !request.url}
          onClick={submit}
          style={buttonStyle}
          type="button"
        >
          {busy ? "Paying..." : actionLabel}
        </button>
        {onCancel ? (
          <button onClick={onCancel} style={secondaryButtonStyle} type="button">
            {cancelLabel}
          </button>
        ) : null}
      </div>

      {error ? <PaymentError message={error} /> : null}
      {showResponse && result ? <PaymentResult result={result} /> : null}
    </section>
  );
}

export function createCastaiCheckout(
  props: CastaiCheckoutProps
): CastaiCheckoutController {
  return {
    mount: (container) => renderCastaiCheckout({ ...props, container }),
    props,
  };
}

export async function renderCastaiCheckout({
  container,
  ...props
}: RenderCastaiCheckoutOptions): Promise<RenderedCastaiCheckout> {
  const { createRoot } = await import("react-dom/client");
  const element = resolveContainer(container);
  const root = createRoot(element);
  let currentProps = props;

  root.render(<CastaiCheckout {...currentProps} />);

  return {
    element,
    unmount: () => root.unmount(),
    update: (nextProps) => {
      currentProps = { ...currentProps, ...nextProps };
      root.render(<CastaiCheckout {...currentProps} />);
    },
  };
}

export function PaymentResult({ result }: { result: AgentResourceResponse }) {
  return (
    <pre
      style={{
        background: "#111318",
        border: "1px solid rgba(148, 163, 184, 0.25)",
        borderRadius: 6,
        color: "#e2e8f0",
        margin: 0,
        overflowX: "auto",
        padding: 12,
      }}
    >
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

export function PaymentError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        background: "rgba(239, 68, 68, 0.12)",
        border: "1px solid rgba(239, 68, 68, 0.35)",
        borderRadius: 6,
        color: "#fecaca",
        padding: 12,
      }}
    >
      {message}
    </div>
  );
}

function CheckoutMeta({ label, value }: { label: string; value: string }) {
  return (
    <div style={metaItemStyle}>
      <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{label}</span>
      <span
        style={{
          color: "#f8fafc",
          fontSize: "0.86rem",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function parseHeaders(value: string): Record<string, string> | undefined {
  if (!value.trim()) return undefined;

  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Headers must be a JSON object.");
  }

  return Object.fromEntries(
    Object.entries(parsed).map(([key, headerValue]) => {
      if (typeof headerValue !== "string") {
        throw new Error(`Header ${key} must be a string.`);
      }

      return [key, headerValue];
    })
  );
}

function resolveContainer(container: CastaiCheckoutContainer) {
  if (typeof container !== "string") return container;

  const element = document.querySelector(container);
  if (!element) {
    throw new Error(`Checkout container not found: ${container}`);
  }

  return element;
}
