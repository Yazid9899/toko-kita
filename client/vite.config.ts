import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared")
    }
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000"
    },
    fs: {
      allow: [
        path.resolve(__dirname, ".."),
        path.resolve(__dirname, "../shared")
      ]
    }
  }
});
