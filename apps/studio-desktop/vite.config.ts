import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const monorepoRoot = path.resolve(rootDir, "../..");
const studioSrc = path.resolve(monorepoRoot, "packages/studio/src");
const uiSrc = path.resolve(monorepoRoot, "packages/ui/src");

const SOURCE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];

function resolveExistingFile(basePath: string) {
  for (const extension of SOURCE_EXTENSIONS) {
    const candidate = `${basePath}${extension}`;
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function monorepoAtAlias(): Plugin {
  return {
    name: "monorepo-at-alias",
    resolveId(source, importer) {
      if (source === "@/lib/utils") {
        return path.resolve(uiSrc, "lib/utils.ts");
      }

      if (!source.startsWith("@/")) {
        return null;
      }

      const subpath = source.slice(2);
      const normalizedImporter = importer?.replace(/\\/g, "/") ?? "";

      if (subpath === "components/shimmering-text") {
        return path.resolve(
          monorepoRoot,
          "apps/web/components/shimmering-text.tsx"
        );
      }

      if (normalizedImporter.includes("/packages/ui/")) {
        return resolveExistingFile(path.resolve(uiSrc, subpath));
      }

      if (normalizedImporter.includes("/packages/studio/")) {
        if (subpath === "lib/utils") {
          return path.resolve(uiSrc, "lib/utils.ts");
        }
        return resolveExistingFile(path.resolve(studioSrc, subpath));
      }

      return null;
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), monorepoAtAlias()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: [monorepoRoot],
    },
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@bklitui/ui/lib/utils": path.resolve(uiSrc, "lib/utils.ts"),
      "@bklitui/ui/charts": path.resolve(uiSrc, "charts/index.ts"),
    },
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target:
      process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
});
