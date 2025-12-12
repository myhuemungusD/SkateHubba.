import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@ui": path.resolve(__dirname, "../../packages/ui"),
      "@skatehubba/types": path.resolve(__dirname, "../../packages/types/index.ts"),
      "@skate-types": path.resolve(__dirname, "../../packages/types"),
      "@zora": path.resolve(__dirname, "../../packages/zora"),
      "@hubba": path.resolve(__dirname, "../../packages/hubba-coin"),
      "@utils": path.resolve(__dirname, "../../packages/utils"),
    },
  },
  test: {
    environment: "node",
    include: ["app/lib/__tests__/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/e2e/**"],
    reporters: "default",
  },
});