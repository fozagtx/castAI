import { defineConfig } from "tsup";

const baseConfig = {
  entry: {
    "adapters/agentkit": "src/adapters/agentkit.ts",
    "adapters/goat": "src/adapters/goat.ts",
    "adapters/langchain": "src/adapters/langchain.ts",
    "adapters/openai": "src/adapters/openai.ts",
    "adapters/vercel-ai": "src/adapters/vercel-ai.ts",
    index: "src/index.ts",
    react: "src/react.tsx",
    "react/headless": "src/react/headless.ts",
    "react/ui": "src/react/ui.ts",
  },
  dts: {
    resolve: true,
  },
  external: ["react", "react-dom/client", "react/jsx-runtime"],
  sourcemap: true,
  target: "es2020",
};

export default defineConfig([
  {
    ...baseConfig,
    format: "esm",
    outDir: "dist/esm",
    clean: true,
  },
  {
    ...baseConfig,
    format: "cjs",
    outDir: "dist/cjs",
    clean: false,
  },
]);
