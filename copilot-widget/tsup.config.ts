import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["lib/index.ts"],
  format: ["esm", "cjs"],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: true,
  treeshake: true,
  external: ["react", "react/jsx-runtime"],
  minify: true,
  platform: "browser",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
});
