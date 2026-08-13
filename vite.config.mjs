import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  build: {
    // Keep the warning threshold explicit so future changes are measured against
    // the default Vite limit instead of silently hiding larger chunks.
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "pdf-viewer",
              test: /node_modules[\\/]pdfjs-dist[\\/]/,
              priority: 10,
              maxSize: 450 * 1024,
            },
            {
              name: "semantic-search",
              test: /node_modules[\\/](@comunica|n3)[\\/]/,
              priority: 10,
              maxSize: 450 * 1024,
            },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
