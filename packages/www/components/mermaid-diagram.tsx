"use client";

import { useEffect, useId, useRef, useState } from "react";

const mermaidScriptUrl =
  "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";

interface MermaidApi {
  initialize: (config: Record<string, unknown>) => void;
  render: (
    id: string,
    chart: string
  ) => Promise<{ svg: string; bindFunctions?: (element: Element) => void }>;
}

declare global {
  interface Window {
    mermaid?: MermaidApi;
  }
}

let mermaidPromise: Promise<MermaidApi> | null = null;

export function MermaidDiagram({
  chart,
  title,
}: {
  chart: string;
  title?: string;
}) {
  const reactId = useId();
  const diagramId = `castai-mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function renderDiagram() {
      try {
        const mermaid = await loadMermaid();

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: {
            background: "transparent",
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            lineColor: "#64748b",
            primaryBorderColor: "#0f172a",
            primaryColor: "#f8fafc",
            primaryTextColor: "#0f172a",
            secondaryBorderColor: "#64748b",
            secondaryColor: "#eef2ff",
            secondaryTextColor: "#0f172a",
            tertiaryBorderColor: "#94a3b8",
            tertiaryColor: "#f1f5f9",
            tertiaryTextColor: "#0f172a",
          },
        });

        const rendered = await mermaid.render(diagramId, chart);

        if (!active || !containerRef.current) return;

        containerRef.current.innerHTML = rendered.svg;
        rendered.bindFunctions?.(containerRef.current);
        setError(null);
      } catch (renderError) {
        if (!active) return;
        setError(
          renderError instanceof Error
            ? renderError.message
            : "Mermaid diagram failed to render."
        );
      }
    }

    void renderDiagram();

    return () => {
      active = false;
    };
  }, [chart, diagramId]);

  return (
    <figure className="mermaid-diagram">
      {title ? <figcaption>{title}</figcaption> : null}
      <div
        aria-label={title ?? "Mermaid diagram"}
        className="mermaid-diagram__canvas"
        ref={containerRef}
        role="img"
      />
      {error ? (
        <pre className="mermaid-diagram__fallback">{`${error}\n\n${chart}`}</pre>
      ) : null}
    </figure>
  );
}

function loadMermaid() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Mermaid can only render in the browser."));
  }

  if (window.mermaid) {
    return Promise.resolve(window.mermaid);
  }

  mermaidPromise ??= new Promise<MermaidApi>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${mermaidScriptUrl}"]`
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        window.mermaid ? resolve(window.mermaid) : rejectMissingMermaid(reject);
      });
      existingScript.addEventListener("error", () => {
        reject(new Error("Failed to load Mermaid renderer."));
      });
      return;
    }

    const script = document.createElement("script");

    script.src = mermaidScriptUrl;
    script.async = true;
    script.onload = () => {
      window.mermaid ? resolve(window.mermaid) : rejectMissingMermaid(reject);
    };
    script.onerror = () => {
      reject(new Error("Failed to load Mermaid renderer."));
    };

    document.head.appendChild(script);
  });

  return mermaidPromise;
}

function rejectMissingMermaid(reject: (reason?: unknown) => void) {
  reject(new Error("Mermaid renderer did not initialize."));
}
