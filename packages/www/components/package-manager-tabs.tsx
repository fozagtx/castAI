"use client";

import { CheckmarkCircle01Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { HugeIcon } from "@/components/ui/huge-icon";

type PackageManagerTabsProps = {
  packages?: string;
  scripts?: {
    bun: string;
    npm: string;
    pnpm: string;
    yarn: string;
  };
};

function CodeLine({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const command = children.trim();

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  async function copyCommand() {
    if (!command) return;

    try {
      await navigator.clipboard.writeText(command);
    } catch {
      copyWithTextarea(command);
    }

    setCopied(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="package-manager-command">
      <pre className="package-manager-code">
        <code>{command}</code>
      </pre>
      <Button
        aria-label={`Copy command: ${command}`}
        className="package-manager-copy"
        onClick={copyCommand}
        size="icon-sm"
        title={copied ? "Copied" : "Copy command"}
        type="button"
        variant="outline"
      >
        <HugeIcon
          aria-hidden="true"
          icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
          size={16}
        />
      </Button>
    </div>
  );
}

function copyWithTextarea(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function PackageInstall({ packages = "" }: PackageManagerTabsProps) {
  const value = packages.trim();

  return (
    <Tabs
      defaultIndex={0}
      items={["npm", "pnpm", "yarn", "bun"]}
      label="Package manager"
    >
      <Tab>
        <CodeLine>{`npm install ${value}`.trim()}</CodeLine>
      </Tab>
      <Tab>
        <CodeLine>{`pnpm add ${value}`.trim()}</CodeLine>
      </Tab>
      <Tab>
        <CodeLine>{`yarn add ${value}`.trim()}</CodeLine>
      </Tab>
      <Tab>
        <CodeLine>{`bun add ${value}`.trim()}</CodeLine>
      </Tab>
    </Tabs>
  );
}

export function PackageScripts({ scripts }: PackageManagerTabsProps) {
  if (!scripts) return null;

  return (
    <Tabs
      defaultIndex={0}
      items={["npm", "pnpm", "yarn", "bun"]}
      label="Package manager"
    >
      <Tab>
        <CodeLine>{scripts.npm}</CodeLine>
      </Tab>
      <Tab>
        <CodeLine>{scripts.pnpm}</CodeLine>
      </Tab>
      <Tab>
        <CodeLine>{scripts.yarn}</CodeLine>
      </Tab>
      <Tab>
        <CodeLine>{scripts.bun}</CodeLine>
      </Tab>
    </Tabs>
  );
}
