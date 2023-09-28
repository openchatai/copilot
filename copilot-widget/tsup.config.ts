import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["lib/index.ts"],
  format: ["cjs", "esm"],
  splitting: false,
  sourcemap: "inline",
  clean: true,
  dts: true,
  treeshake: true,
  external: ["react"],
});
