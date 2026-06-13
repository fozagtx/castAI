"use client";

import { createMarkdownRenderer } from "fumadocs-core/content/md";

const renderer = createMarkdownRenderer();
const MarkdownRenderer = renderer.Markdown;

type MarkdownProps = {
  text: string;
};

export function Markdown({ text }: MarkdownProps) {
  return (
    <MarkdownRenderer
      components={{
        a: ({ href, children }) => (
          <a
            href={href}
            rel="noreferrer"
            target={href?.startsWith("http") ? "_blank" : undefined}
          >
            {children}
          </a>
        ),
      }}
    >
      {text}
    </MarkdownRenderer>
  );
}
