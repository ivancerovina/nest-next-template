import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import externalPlugins from "./vite-plugins/external-plugins";

export default defineConfig({
  plugins: [react(), externalPlugins(), tailwindcss(), devtools()],
  resolve: {
    conditions: ["browser", "import", "module"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
