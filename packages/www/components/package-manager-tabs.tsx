"use client";

import { Tab, Tabs } from "fumadocs-ui/components/tabs";

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
  return (
    <pre className="package-manager-code">
      <code>{children}</code>
    </pre>
  );
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
