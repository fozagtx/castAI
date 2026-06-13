"use client";

import type { Root } from "fumadocs-core/page-tree";
import type { ReactNode } from "react";
import {
  BotIcon,
  File01Icon,
  GithubIcon,
  MessageCircleCodeIcon,
} from "@hugeicons/core-free-icons";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import Image from "next/image";

import {
  AISearch,
  AISearchPanel,
  AISearchTrigger,
} from "@/components/ai/search";
import { buttonVariants } from "@/components/ui/button";
import { HugeIcon } from "@/components/ui/huge-icon";
import { cn } from "@/lib/utils";

type DocsLayoutClientProps = {
  children: ReactNode;
  tree: Root;
};

export function DocsLayoutClient({ children, tree }: DocsLayoutClientProps) {
  return (
    <DocsLayout
      tree={tree}
      links={[
        {
          type: "main",
          text: "llm.text",
          url: "/docs/ai-sdk/llm-text",
        },
        {
          type: "main",
          icon: (
            <Image
              alt=""
              aria-hidden="true"
              height={16}
              src="/openclaw.svg"
              width={16}
            />
          ),
          text: "OpenClaw",
          url: "/docs/ai-sdk/openclaw",
        },
        {
          type: "main",
          icon: <HugeIcon aria-hidden="true" icon={BotIcon} size={16} />,
          text: "llms.txt",
          url: "/llms.txt",
        },
        {
          type: "main",
          icon: <HugeIcon aria-hidden="true" icon={File01Icon} size={16} />,
          text: "llms-full.txt",
          url: "/llms-full.txt",
        },
        {
          type: "icon",
          external: true,
          icon: <HugeIcon aria-hidden="true" icon={GithubIcon} size={18} />,
          label: "GitHub",
          text: "GitHub",
          url: "https://github.com/fozagtx/castAI",
        },
      ]}
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
      }}
      sidebar={{ collapsible: true }}
      slots={{
        navTitle: ({ className }) => (
          <span className={className}>
            <Image
              alt="castAI"
              className="docs-nav-logo"
              height={28}
              priority
              src="/favicon.svg"
              style={{ height: 28, width: 28 }}
              width={28}
            />
          </span>
        ),
      }}
    >
      <AISearch>
        <AISearchPanel />
        <AISearchTrigger
          position="float"
          className={cn(
            buttonVariants({
              variant: "secondary",
              size: "lg",
            }),
            "rounded-2xl border border-border bg-background/95 px-3 text-foreground shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80"
          )}
        >
          <HugeIcon icon={MessageCircleCodeIcon} size={16} />
          Ask AI
        </AISearchTrigger>
      </AISearch>
      {children}
    </DocsLayout>
  );
}
