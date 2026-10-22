import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { codeThemes } from "./lib/code-theme";

export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  // Exposes `page.data.lastModified` (last commit touching the file) for the
  // sitemap and TechArticle `dateModified`.
  lastModifiedTime: "git",
  mdxOptions: {
    rehypeCodeOptions: {
      themes: codeThemes,
    },
  },
});
