"use client";

import type { FileSystemTree, WebContainer } from "@webcontainer/api";
import {
  ComputerTerminal01Icon,
  PlayIcon,
  RotateClockwiseIcon,
} from "@hugeicons/core-free-icons";
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
import { HugeIcon } from "@/components/ui/huge-icon";

type PlaygroundState = "idle" | "booting" | "running" | "blocked" | "error";

let webContainerPromise: Promise<WebContainer> | null = null;

const files = {
  "index.html": {
    file: {
      contents: `<div id="root"></div><script type="module" src="/src/App.jsx"></script>`,
    },
  },
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          dependencies: {
            "@castaisdk/ai-sdk": "latest",
            "@vitejs/plugin-react": "latest",
            vite: "latest",
            react: "latest",
            "react-dom": "latest",
          },
          devDependencies: {},
          scripts: {
            dev: "vite --host 0.0.0.0",
          },
          type: "module",
        },
        null,
        2
      ),
    },
  },
  "src/App.jsx": {
    file: {
      contents: `import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CastaiCheckout,
  CastaiCheckoutHeadless,
  PaymentTester,
} from "@castaisdk/ai-sdk/react";
import "./style.css";

const blockedFetch = async () => {
  throw new Error("Connect a server-owned Casper payment fetcher to submit.");
};

function App() {
  const [amount, setAmount] = useState("0.001");
  const [scheme, setScheme] = useState("x402");
  const [resourceUrl, setResourceUrl] = useState("https://api.example.com/protected");
  const request = useMemo(() => ({ url: resourceUrl }), [resourceUrl]);

  return (
    <main>
      <section className="controls" aria-label="Checkout controls">
        <label>
          Scheme
          <select value={scheme} onChange={(event) => setScheme(event.target.value)}>
            <option value="x402">x402</option>
            <option value="mpp">MPP</option>
          </select>
        </label>
        <label>
          Amount
          <input value={amount} onChange={(event) => setAmount(event.target.value)} />
        </label>
        <label>
          Resource
          <input value={resourceUrl} onChange={(event) => setResourceUrl(event.target.value)} />
        </label>
      </section>

      <CastaiCheckout
        actionLabel={\`Pay \${amount} CSPR\`}
        amount={amount}
        description="Live SDK checkout component running inside a WebContainer Vite app."
        mppFetch={scheme === "mpp" ? blockedFetch : undefined}
        network="casper:testnet"
        recipient="Configured recipient"
        request={request}
        scheme={scheme}
        showResponse={false}
        title="castAI checkout"
        x402Fetch={scheme === "x402" ? blockedFetch : undefined}
      />

      <CastaiCheckoutHeadless
        mppFetch={scheme === "mpp" ? blockedFetch : undefined}
        request={request}
        scheme={scheme}
        x402Fetch={scheme === "x402" ? blockedFetch : undefined}
      >
        {({ canSubmit, error, reset, result, submit }) => (
          <section className="headless" aria-label="Headless checkout state">
            <strong>Headless state</strong>
            <span>canSubmit: {String(canSubmit)}</span>
            <span>status: {error ? error.message : result ? "paid" : "ready"}</span>
            <div>
              <button type="button" onClick={() => submit().catch(() => undefined)}>
                Run headless submit
              </button>
              <button type="button" onClick={reset}>
                Reset
              </button>
            </div>
          </section>
        )}
      </CastaiCheckoutHeadless>

      <PaymentTester
        defaultHeaders='{"accept":"application/json"}'
        defaultScheme={scheme}
        defaultUrl={resourceUrl}
        mppFetch={blockedFetch}
        title="castAI payment tester"
        x402Fetch={blockedFetch}
      />
    </main>
  );
}

createRoot(document.querySelector("#root")).render(<App />);
`,
    },
  },
  "src/style.css": {
    file: {
      contents: `:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #0f172a;
  background: #f8fafc;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

main {
  display: grid;
  gap: 16px;
  margin: 0 auto;
  max-width: 780px;
  padding: 24px;
}

.controls {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
}

label {
  display: grid;
  gap: 6px;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
}

input,
select {
  width: 100%;
  border: 1px solid #dbe3ee;
  border-radius: 6px;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
  padding: 10px 12px;
}

.headless {
  display: grid;
  gap: 8px;
  border: 1px solid #dbe3ee;
  border-radius: 8px;
  background: #ffffff;
  padding: 16px;
}

.headless div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.headless button {
  border: 1px solid #171717;
  border-radius: 6px;
  background: #171717;
  color: #fafafa;
  cursor: pointer;
  font-weight: 700;
  padding: 10px 12px;
}

.headless button + button {
  border-color: #dbe3ee;
  background: #ffffff;
  color: #0f172a;
}
`,
    },
  },
} satisfies FileSystemTree;

async function getWebContainer() {
  if (!webContainerPromise) {
    webContainerPromise = import("@webcontainer/api").then(({ WebContainer }) =>
      WebContainer.boot({
        coep: "require-corp",
        forwardPreviewErrors: "exceptions-only",
      })
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

        const install = await container.spawn("npm", ["install"]);
        void install.output.pipeTo(
          new WritableStream({
            write(data) {
              setLogs((current) => [...current.slice(-8), data.trim()]);
            },
          })
        );

        const installExit = await install.exit;
        if (installExit !== 0) {
          throw new Error(`npm install failed with exit code ${installExit}.`);
        }

        const process = await container.spawn("npm", ["run", "dev"]);
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
          <CardTitle>SDK checkout in a browser runtime</CardTitle>
          <CardDescription>
            Boot a Vite app in the browser and render the castAI React checkout
            and headless state API.
          </CardDescription>
        </div>

        <Badge data-state={state} variant={statusVariant}>
          {statusText}
        </Badge>
      </CardHeader>

      <CardContent className="webcontainer-playground__content">
        <div className="webcontainer-playground__actions">
          <Button disabled={!canStart} onClick={start} type="button">
            <HugeIcon
              aria-hidden="true"
              data-icon="inline-start"
              icon={PlayIcon}
              size={16}
            />
            Start runtime
          </Button>
          <Button onClick={resetPanel} type="button" variant="outline">
            <HugeIcon
              aria-hidden="true"
              data-icon="inline-start"
              icon={RotateClockwiseIcon}
              size={16}
            />
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
              <HugeIcon aria-hidden="true" icon={ComputerTerminal01Icon} />
              <span>Runtime log</span>
            </div>
            <pre>{logs.join("\n")}</pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
