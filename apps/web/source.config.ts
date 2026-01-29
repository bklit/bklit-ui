import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { codeThemes } from "./lib/code-theme";

export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: codeThemes,
    },
  },
});
