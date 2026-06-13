#!/usr/bin/env node

import type { CastaiTemplateName, PackageManager } from "./index.js";
import {
  assertPackageManager,
  createDoctorResult,
  createMcpConfig,
  listTemplates,
  packageManagers,
  scaffoldTemplate,
} from "./index.js";

type ParsedArgs = {
  command: string | undefined;
  flags: Map<string, string | boolean>;
  positionals: string[];
};

export async function main(argv = process.argv.slice(2)) {
  const parsed = parseArgs(argv);

  try {
    if (
      !parsed.command ||
      parsed.command === "help" ||
      parsed.flags.has("help")
    ) {
      printHelp();
      return;
    }

    if (parsed.command === "templates") {
      writeOutput(
        listTemplates().map(({ description, name }) => ({ description, name })),
        parsed.flags.has("json")
      );
      return;
    }

    if (parsed.command === "doctor") {
      writeOutput(createDoctorResult(), parsed.flags.has("json"));
      return;
    }

    if (parsed.command === "mcp-config" || parsed.command === "claude-code") {
      const packageManager = readPackageManager(parsed);
      writeOutput(
        createMcpConfig({
          client: "claude-code",
          packageManager,
        }),
        parsed.flags.has("json")
      );
      return;
    }

    if (parsed.command === "scaffold") {
      const [template, directory] = parsed.positionals;
      if (!template || !directory) {
        throw new Error("Usage: castai scaffold <template> <directory>");
      }

      const result = await scaffoldTemplate({
        directory,
        force: parsed.flags.has("force"),
        packageManager: readPackageManager(parsed),
        template: template as CastaiTemplateName,
      });
      writeOutput(result, parsed.flags.has("json"));
      return;
    }

    throw new Error(`Unknown command: ${parsed.command}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

function parseArgs(argv: string[]): ParsedArgs {
  const [rawCommand, ...rest] = argv;
  const command = rawCommand?.startsWith("-") ? undefined : rawCommand;
  const values = rawCommand?.startsWith("-") ? argv : rest;
  const flags = new Map<string, string | boolean>();
  const positionals: string[] = [];

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === "-h") {
      flags.set("help", true);
      continue;
    }

    if (!value?.startsWith("--")) {
      if (value) positionals.push(value);
      continue;
    }

    const key = value.slice(2);
    const next = rest[index + 1];
    if (next && !next.startsWith("--")) {
      flags.set(key, next);
      index += 1;
    } else {
      flags.set(key, true);
    }
  }

  return { command, flags, positionals };
}

function readPackageManager(parsed: ParsedArgs): PackageManager {
  const value = parsed.flags.get("package-manager");
  if (typeof value === "string") return assertPackageManager(value);
  return "npm";
}

function writeOutput(value: unknown, json: boolean) {
  if (json) {
    console.log(JSON.stringify(value, null, 2));
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      console.log(`${item.name}\t${item.description}`);
    }
    return;
  }

  console.log(JSON.stringify(value, null, 2));
}

function printHelp() {
  console.log(`castai

Commands:
  castai templates [--json]
  castai scaffold <template> <directory> [--package-manager npm|pnpm|yarn|bun] [--force] [--json]
  castai mcp-config [--package-manager npm|pnpm|yarn|bun] [--json]
  castai claude-code [--package-manager npm|pnpm|yarn|bun] [--json]
  castai doctor [--json]

Package managers: ${packageManagers.join(", ")}
`);
}

void main();
