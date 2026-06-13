import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  createDoctorResult,
  createMcpConfig,
  installCommand,
  listTemplates,
  scaffoldTemplate,
} from "./index.js";

describe("castAI CLI library", () => {
  it("lists templates and package manager install commands", () => {
    expect(listTemplates().map((template) => template.name)).toEqual([
      "next-checkout",
      "agent-vercel-ai",
      "mcp-claude-code",
    ]);
    expect(installCommand("npm")).toBe("npm install");
    expect(installCommand("pnpm")).toBe("pnpm install");
    expect(installCommand("yarn")).toBe("yarn install");
    expect(installCommand("bun")).toBe("bun install");
  });

  it("creates MCP config for Claude Code", () => {
    expect(createMcpConfig({ packageManager: "pnpm" })).toEqual({
      mcpServers: {
        castai: {
          args: ["dlx", "@castai/mcp@latest"],
          command: "pnpm",
        },
      },
    });
  });

  it("reports signer status without exposing secret values", () => {
    expect(
      createDoctorResult({ CASPER_PRIVATE_KEY_PEM: "secret" })
    ).toMatchObject({
      signerConfigured: true,
    });
  });

  it("scaffolds template files", async () => {
    const directory = await mkdtemp(join(tmpdir(), "castai-cli-"));

    try {
      const result = await scaffoldTemplate({
        directory,
        packageManager: "bun",
        template: "mcp-claude-code",
      });

      expect(result.files).toContain(".mcp.json");
      expect(result.installCommand).toBe("bun install");
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });
});
