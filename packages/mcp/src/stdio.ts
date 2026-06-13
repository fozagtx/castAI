#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createCastaiMcpServer } from "./index.js";

const server = createCastaiMcpServer();
const transport = new StdioServerTransport();

void server.connect(transport).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
