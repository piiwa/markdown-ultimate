import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure-logic unit tests only — no VS Code / DOM environment needed.
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
