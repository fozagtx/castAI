import type { ReactNode } from "react";

import { source } from "@/lib/source";

import { DocsLayoutClient } from "./docs-layout-client";

export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return <DocsLayoutClient tree={source.pageTree}>{children}</DocsLayoutClient>;
}
