import {
  defineCollections,
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";
import { codeThemes } from "./lib/code-theme";

export const docs = defineDocs({
  dir: "content/docs",
});

/**
 * Changelog entries — one markdown file per release note, named
 * `YYYY-MM-DD-<slug>.mdx`. Authoring guide: `.agents/skills/bklit-changelog`.
 */
export const changelog = defineCollections({
  type: "doc",
  dir: "content/changelog",
  schema: frontmatterSchema.extend({
    /**
     * Publish date, `YYYY-MM-DD`. Entries sort newest first; add a UTC time
     * (`2026-10-22T18:00:00Z`) to order several entries on the same day.
     */
    date: z.coerce.date(),
    /** Cover art under `public/changelog/` — single-colour SVG, see the skill. */
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    /** Short topic labels, also matched by search. */
    tags: z.array(z.string()).default([]),
  }),
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
