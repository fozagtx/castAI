import type { MDXComponents } from "mdx/types";
import defaultMdxComponents from "fumadocs-ui/mdx";

import { MermaidDiagram } from "./mermaid-diagram";
import { PackageInstall, PackageScripts } from "./package-manager-tabs";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    MermaidDiagram,
    PackageInstall,
    PackageScripts,
    ...components,
  };
}
