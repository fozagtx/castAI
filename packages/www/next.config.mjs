import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createNextStory } from "@fumadocs/story/next";
import { createMDX } from "fumadocs-mdx/next";

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(__dirname, "../..");
const isServerRuntime = process.env.CASTAI_DOCS_RUNTIME === "server";

/** @type {import('next').NextConfig} */
const config = {
  ...(isServerRuntime ? {} : { output: "export" }),
  outputFileTracingRoot: workspaceRoot,
  reactStrictMode: true,
  ...(process.env.NODE_ENV === "development" || isServerRuntime
    ? {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                {
                  key: "Cross-Origin-Embedder-Policy",
                  value: "require-corp",
                },
                {
                  key: "Cross-Origin-Opener-Policy",
                  value: "same-origin",
                },
              ],
            },
          ];
        },
      }
    : {}),
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: workspaceRoot,
  },
};

const withMDX = createMDX();
const withStory = createNextStory();

export default withStory(withMDX(config));
