import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";

import "./global.css";

import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "castAI Docs",
    template: "%s - castAI Docs",
  },
  description:
    "Casper x402, MPP, facilitator, and router documentation for castAI.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans")}>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
