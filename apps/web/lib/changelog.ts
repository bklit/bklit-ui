import type { ComponentType } from "react";
import { changelog } from "@/.source";

export interface ChangelogEntry {
  /** File name without `.mdx`, e.g. `2026-10-22-smart-value-labels`. */
  slug: string;
  url: string;
  title: string;
  description?: string;
  /** `YYYY-MM-DD` (UTC). */
  date: string;
  /** Full publish time — orders entries that share a day. */
  timestamp: number;
  image?: string;
  imageAlt?: string;
  tags: string[];
  body: ComponentType<Record<string, unknown>>;
  /** Lower-cased title, description, tags and markdown text for search. */
  searchText: string;
}

const mdxExtensionPattern = /\.mdx?$/;
const frontmatterPattern = /^---[\s\S]*?---/;
const markdownSyntaxPattern = /[`*_#>[\]()!|~-]+/g;
const whitespacePattern = /\s+/g;

function toSearchText(parts: (string | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .replace(markdownSyntaxPattern, " ")
    .replace(whitespacePattern, " ")
    .trim()
    .toLowerCase();
}

const entries: ChangelogEntry[] = changelog
  .map((doc) => {
    const slug = doc._file.path.replace(mdxExtensionPattern, "");
    const markdown = doc.content.replace(frontmatterPattern, "");
    return {
      slug,
      url: `/changelog/${slug}`,
      title: doc.title,
      description: doc.description,
      date: doc.date.toISOString().slice(0, 10),
      timestamp: doc.date.getTime(),
      image: doc.image,
      imageAlt: doc.imageAlt,
      tags: doc.tags,
      body: doc.body,
      searchText: toSearchText([
        doc.title,
        doc.description,
        doc.tags.join(" "),
        markdown,
      ]),
    };
  })
  // Newest first. Same-day entries can carry a time (`2026-10-22T18:00:00Z`)
  // to set their order; otherwise slug order keeps it stable.
  .sort((a, b) => b.timestamp - a.timestamp || b.slug.localeCompare(a.slug));

export function getChangelogEntries(): ChangelogEntry[] {
  return entries;
}

export function getChangelogEntry(slug: string): ChangelogEntry | undefined {
  return entries.find((entry) => entry.slug === slug);
}

/** Dark-mode Open Graph card for an entry (or the latest one, for the index). */
export function changelogOgImagePath(slug?: string): string {
  return slug ? `/api/og/changelog/${slug}` : "/api/og/changelog";
}

/** Entries per paginated changelog page. */
export const CHANGELOG_PAGE_SIZE = 20;

export function getChangelogPageCount(): number {
  return Math.max(1, Math.ceil(entries.length / CHANGELOG_PAGE_SIZE));
}

/** 1-based page of entries, newest first. */
export function getChangelogPage(page: number): ChangelogEntry[] {
  const start = (page - 1) * CHANGELOG_PAGE_SIZE;
  return entries.slice(start, start + CHANGELOG_PAGE_SIZE);
}

/** The page an entry is listed on. */
export function getChangelogPageForSlug(slug: string): number {
  const index = entries.findIndex((entry) => entry.slug === slug);
  return index === -1 ? 1 : Math.floor(index / CHANGELOG_PAGE_SIZE) + 1;
}

export function changelogPageHref(page: number): string {
  return page <= 1 ? "/changelog" : `/changelog/page/${page}`;
}
