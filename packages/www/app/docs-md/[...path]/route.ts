import { notFound } from "next/navigation";

import { getLLMText } from "@/lib/get-llm-text";
import { source } from "@/lib/source";

type MarkdownRouteProps = {
  params: Promise<{
    path: string[];
  }>;
};

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

export async function GET(_request: Request, { params }: MarkdownRouteProps) {
  const { path } = await params;
  const page = source.getPage(markdownPathToSlugs(path));
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    path: page.path.replace(/\.mdx$/, ".md").split("/"),
  }));
}

function markdownPathToSlugs(path: string[]) {
  const last = path.at(-1);
  if (!last?.endsWith(".md")) notFound();

  const fileName = last.slice(0, -".md".length);
  const segments = [...path.slice(0, -1), fileName];
  return segments.at(-1) === "index" ? segments.slice(0, -1) : segments;
}
