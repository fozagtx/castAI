"use client";

import type { FileSystemTree, WebContainer } from "@webcontainer/api";
import { Play, RotateCcw, Terminal } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PlaygroundState = "idle" | "booting" | "running" | "blocked" | "error";

let webContainerPromise: Promise<WebContainer> | null = null;

const files = {
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          type: "module",
          scripts: {
            dev: "node server.mjs",
          },
        },
        null,
        2
      ),
    },
  },
  "server.mjs": {
    file: {
      contents: `import http from "node:http";

const html = \`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>castAI checkout DOM mount</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body {
        margin: 0;
        min-height: 100vh;
        background: #f8fafc;
        color: #0f172a;
      }

      main {
        display: grid;
        gap: 16px;
        margin: 0 auto;
        max-width: 760px;
        padding: 24px;
      }

      label {
        display: grid;
        gap: 6px;
        color: #64748b;
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
      }

      input,
      select {
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: #ffffff;
        color: #0f172a;
        font: inherit;
        padding: 10px 12px;
      }

      button {
        width: fit-content;
        border: 1px solid #171717;
        border-radius: 6px;
        background: #171717;
        color: #fafafa;
        cursor: pointer;
        font-weight: 800;
        padding: 10px 12px;
      }

      .grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }

      .checkout {
        display: grid;
        gap: 14px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #ffffff;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        padding: 16px;
      }

      .checkout h1 {
        margin: 0;
        color: #0f172a;
        font-size: 0.95rem;
        font-weight: 650;
      }

      .meta {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      }

      .meta div {
        display: grid;
        gap: 4px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: #f8fafc;
        padding: 10px;
      }

      .meta span {
        color: #64748b;
        font-size: 0.72rem;
      }

      code {
        overflow-wrap: anywhere;
        color: #0f172a;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="grid" aria-label="Checkout controls">
        <label>
          Scheme
          <select id="scheme">
            <option value="x402">x402</option>
            <option value="mpp">MPP</option>
          </select>
        </label>
        <label>
          Amount
          <input id="amount" value="0.001" />
        </label>
        <label>
          Network
          <select id="network">
            <option value="casper:testnet">casper:testnet</option>
            <option value="casper:mainnet">casper:mainnet</option>
          </select>
        </label>
        <label>
          Resource
          <input id="resource" value="https://api.example.com/protected" />
        </label>
      </section>

      <div id="castai-checkout"></div>
    </main>

    <script>
      const mount = document.querySelector("#castai-checkout");
      const ids = ["scheme", "amount", "network", "resource"];

      function value(id) {
        return document.querySelector("#" + id).value;
      }

      function renderCheckout() {
        mount.innerHTML = \`
          <section class="checkout" aria-label="castAI checkout">
            <h1>castAI checkout</h1>
            <p>Programmatic DOM mount for a protected HTTP resource.</p>
            <div class="meta">
              <div><span>Scheme</span><strong>\${value("scheme")}</strong></div>
              <div><span>Network</span><strong>\${value("network")}</strong></div>
              <div><span>Amount</span><strong>\${value("amount")} CSPR</strong></div>
            </div>
            <div class="meta">
              <div><span>Recipient</span><code>Configured recipient</code></div>
              <div><span>Resource</span><code>\${value("resource")}</code></div>
            </div>
            <button type="button">Pay with Casper</button>
          </section>
        \`;
      }

      for (const id of ids) {
        document.querySelector("#" + id).addEventListener("input", renderCheckout);
      }

      renderCheckout();
    </script>
  </body>
</html>\`;

const server = http.createServer((_request, response) => {
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(html);
});

server.listen(5173, "0.0.0.0", () => {
  console.log("castAI checkout preview listening on port 5173");
});
`,
    },
  },
} satisfies FileSystemTree;

async function getWebContainer() {
  if (!webContainerPromise) {
    webContainerPromise = import("@webcontainer/api").then(({ WebContainer }) =>
      WebContainer.boot()
    );
  }

  return webContainerPromise;
}

export function WebContainerPlayground() {
  const [logs, setLogs] = useState<string[]>(["Ready."]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, setState] = useState<PlaygroundState>("idle");
  const processStarted = useRef(false);

  const canStart = state === "idle" || state === "error" || state === "blocked";
  const statusText = useMemo(() => {
    if (state === "booting") return "Starting WebContainer...";
    if (state === "running") return "Running";
    if (state === "blocked") return "Headers required";
    if (state === "error") return "Start failed";
    return "Idle";
  }, [state]);
  const statusVariant =
    state === "error" || state === "blocked" ? "destructive" : "secondary";

  async function start() {
    if (!canStart) return;

    if (!globalThis.crossOriginIsolated) {
      setState("blocked");
      setLogs([
        "WebContainers require cross-origin isolation.",
        "Serve this page with Cross-Origin-Embedder-Policy: require-corp.",
        "Serve this page with Cross-Origin-Opener-Policy: same-origin.",
      ]);
      return;
    }

    setState("booting");
    setLogs(["Booting WebContainer..."]);
    setPreviewUrl(null);

    try {
      const container = await getWebContainer();
      await container.mount(files);

      if (!processStarted.current) {
        container.on("server-ready", (_port, url) => {
          setPreviewUrl(url);
          setState("running");
          setLogs((current) => [...current, `Preview ready: ${url}`]);
        });

        const process = await container.spawn("node", ["server.mjs"]);
        processStarted.current = true;

        void process.output.pipeTo(
          new WritableStream({
            write(data) {
              setLogs((current) => [...current.slice(-8), data.trim()]);
            },
          })
        );
      }
    } catch (error) {
      setState("error");
      setLogs([
        error instanceof Error ? error.message : "WebContainer start failed.",
      ]);
    }
  }

  function resetPanel() {
    setPreviewUrl(null);
    setState("idle");
    setLogs(["Ready."]);
  }

  return (
    <Card className="webcontainer-playground" size="sm">
      <CardHeader className="webcontainer-playground__header">
        <div>
          <p className="webcontainer-playground__eyebrow">
            StackBlitz WebContainers
          </p>
          <CardTitle>Checkout UI in a browser runtime</CardTitle>
          <CardDescription>
            Boot a small Node server in the browser, mount a page, and render
            the checkout surface into a DOM node.
          </CardDescription>
        </div>

        <Badge data-state={state} variant={statusVariant}>
          {statusText}
        </Badge>
      </CardHeader>

      <CardContent className="webcontainer-playground__content">
        <div className="webcontainer-playground__actions">
          <Button disabled={!canStart} onClick={start} type="button">
            <Play aria-hidden="true" data-icon="inline-start" />
            Start runtime
          </Button>
          <Button onClick={resetPanel} type="button" variant="outline">
            <RotateCcw aria-hidden="true" data-icon="inline-start" />
            Reset panel
          </Button>
        </div>

        <div className="webcontainer-playground__grid">
          <div className="webcontainer-playground__preview">
            {previewUrl ? (
              <iframe src={previewUrl} title="castAI checkout playground" />
            ) : (
              <div className="webcontainer-playground__empty">
                Preview appears after the runtime starts.
              </div>
            )}
          </div>

          <div className="webcontainer-playground__terminal">
            <div>
              <Terminal aria-hidden="true" />
              <span>Runtime log</span>
            </div>
            <pre>{logs.join("\n")}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
