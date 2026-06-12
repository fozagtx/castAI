import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import Image from "next/image";

import { source } from "@/lib/source";

export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <Image
            alt="castAI"
            className="docs-nav-logo"
            height={28}
            priority
            src="/favicon.svg"
            style={{ height: 28, width: 28 }}
            width={28}
          />
        ),
        url: "/",
      }}
      sidebar={{ collapsible: true }}
    >
      {children}
    </DocsLayout>
  );
}
