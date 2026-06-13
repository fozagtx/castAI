import type { source } from "@/lib/source";

type SourcePage = (typeof source)["$inferPage"];

type PageDataWithText = SourcePage["data"] & {
  getText: (type: "raw" | "processed") => Promise<string>;
};

export async function getLLMText(page: SourcePage) {
  const data = page.data as PageDataWithText;
  const processed = await data.getText("processed");

  return `# ${data.title ?? page.url} (${page.url})

${processed}`;
}
