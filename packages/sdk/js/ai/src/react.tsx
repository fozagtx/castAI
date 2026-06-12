import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import type {
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
