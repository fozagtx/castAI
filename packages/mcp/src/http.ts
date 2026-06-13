#!/usr/bin/env node
import type { ServerResponse } from "node:http";
import { createServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { createCastaiMcpServer } from "./index.js";

const defaultPort = 7860;
const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? defaultPort);
const mcpPaths = new Set(["/mcp", "/gradio_api/mcp", "/gradio_api/mcp/sse"]);

const server = createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }

  const pathname = readPathname(req.url, req.headers.host);

  if (pathname === "/" || pathname === "/health") {
    writeJson(res, 200, {
      name: "castai-mcp",
      endpoints: [...mcpPaths],
      status: "ok",
      transport: "streamable-http",
    });
    return;
  }

  if (!mcpPaths.has(pathname)) {
    writeJson(res, 404, {
      error: "Not found",
      endpoints: [...mcpPaths],
    });
    return;
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  const mcp = createCastaiMcpServer();

  res.on("close", () => {
    void transport.close().catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
    });
  });

  try {
    await mcp.connect(transport);
    await transport.handleRequest(req, res);
  } catch (error) {
    if (!res.headersSent) {
      writeJson(res, 500, {
        error: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    res.destroy(error instanceof Error ? error : undefined);
  }
});

server.listen(port, host, () => {
  console.log(`castAI MCP HTTP server listening on http://${host}:${port}/mcp`);
});

function readPathname(url: string | undefined, headerHost: string | undefined) {
  return new URL(url ?? "/", `http://${headerHost ?? "127.0.0.1"}`).pathname;
}

function setCorsHeaders(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "content-type, last-event-id, mcp-protocol-version, mcp-session-id"
  );
  res.setHeader("Access-Control-Allow-Methods", "DELETE, GET, OPTIONS, POST");
  res.setHeader(
    "Access-Control-Expose-Headers",
    "mcp-protocol-version, mcp-session-id"
  );
}

function writeJson(res: ServerResponse, status: number, value: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(value, null, 2));
}
