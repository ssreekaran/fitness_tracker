// <reference types="vitest" />
// <reference types="vite/client" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/public/**",
        "**/src/types/**",
        "**/src/**/*.d.ts",
        "**/tests/e2e/**", // Exclude Playwright E2E tests
      ],
    },
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["tests/e2e/**"], // Explicitly exclude E2E tests
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
