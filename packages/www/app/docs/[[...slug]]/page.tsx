import type { MDXComponents } from "mdx/types";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { notFound } from "next/navigation";

import { getMDXComponents } from "@/components/mdx";
import { source } from "@/lib/source";

type MdxPageData = {
  body: ComponentType<{ components?: MDXComponents }>;
  description?: string | undefined;
  full?: boolean | undefined;
  title: string;
  toc?: Parameters<typeof DocsPage>[0]["toc"];
};

type DocsPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export default async function Page({ params }: DocsPageProps) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const data = page.data as MdxPageData;
  const MDX = data.body;

  return (
    <DocsPage full={data.full} toc={data.toc}>
      <DocsTitle>{data.title}</DocsTitle>
      <DocsDescription>{data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({
  params,
}: DocsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const data = page.data as MdxPageData;

  return {
    title: data.title,
    description: data.description,
  };
}
