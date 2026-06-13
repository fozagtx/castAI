import { llms } from "fumadocs-core/source";

import { source } from "@/lib/source";

export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  const body = llms(source).index();

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
