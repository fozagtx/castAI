import { defineConfig } from "tsup";

const baseConfig = {
  entry: {
    index: "src/index.ts",
    react: "src/react.tsx",
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
