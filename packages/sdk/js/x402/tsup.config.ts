import { defineConfig } from "tsup";

const baseConfig = {
  entry: {
    client: "src/client.ts",
    facilitator: "src/facilitator.ts",
    server: "src/server.ts",
  },
  dts: {
    resolve: true,
  },
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
