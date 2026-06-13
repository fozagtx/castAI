import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createNextStory } from "@fumadocs/story/next";
import { createMDX } from "fumadocs-mdx/next";

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(__dirname, "../..");

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  reactStrictMode: true,
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
