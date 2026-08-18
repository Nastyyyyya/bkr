import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",

    coverage: {
      provider: "v8",
      reporter: ["text", "html"],

      exclude: [
        "src/assets/**",
        "**/*.png",
        "**/*.jpg",
        "**/*.jpeg",
        "**/*.svg",
        "**/*.gif",
        "**/*.webp",
        "**/*.css",
        "**/*.scss",
        "**/tests-e2e/**",
        "**/Beaver.jsx",
        "**/Flower.jsx",
      ],
    },
  },
});
