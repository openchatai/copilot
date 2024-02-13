import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    minify: true,
    rollupOptions: {
      input: "src/main.tsx",
      output: {
        name: "copilot-widget",
        dir: "dist-embed",
        entryFileNames: "pilot.js",
      },
    },
  },
  server: {
    port: 3005,
  },
});
