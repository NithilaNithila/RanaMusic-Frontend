import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://ranamusic-backend.onrender.com",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split stable vendor libs into cacheable chunks: they never change
        // between deploys, so repeat visitors get them from HTTP cache while
        // only the small app code is re-downloaded. Also lets the browser
        // download vendor + route chunks in parallel instead of one fat file.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (
            id.includes("framer-motion") ||
            id.includes("motion-dom") ||
            id.includes("motion-utils") ||
            id.includes("@motionone")
          ) {
            return "vendor-motion";
          }
          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("axios")) return "vendor-axios";
          if (id.includes("react") || id.includes("scheduler")) {
            return "vendor-react";
          }
          return undefined;
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
  },
});
