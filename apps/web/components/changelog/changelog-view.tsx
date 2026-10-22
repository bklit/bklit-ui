import { ChangelogArticle } from "@/components/changelog/changelog-article";
import { ChangelogFeed } from "@/components/changelog/changelog-feed";
import {
  CHANGELOG_PAGE_SIZE,
  changelogPageHref,
  getChangelogEntries,
  getChangelogPage,
  getChangelogPageCount,
} from "@/lib/changelog";

/**
 * Server wrapper: renders one page of entries (all in the HTML, for crawlers)
 * plus a lightweight index of every entry for search.
 */
export function ChangelogView({
  page,
  initialSlug,
}: {
  page: number;
  initialSlug?: string;
}) {
  const pageCount = getChangelogPageCount();
  const items = getChangelogPage(page).map((entry) => ({
    slug: entry.slug,
    url: entry.url,
    date: entry.date,
    article: (
      <ChangelogArticle
        entry={entry}
        headingAs={entry.slug === initialSlug ? "h1" : "h2"}
      />
    ),
  }));
  const searchIndex = getChangelogEntries().map((entry) => ({
    slug: entry.slug,
    url: entry.url,
    title: entry.title,
    description: entry.description,
    date: entry.date,
    searchText: entry.searchText,
  }));

  return (
    <main className="flex flex-1 flex-col">
      <ChangelogFeed
        baseUrl={
          initialSlug ? `/changelog/${initialSlug}` : changelogPageHref(page)
        }
        initialSlug={initialSlug}
        items={items}
        pagination={{
          offset: (page - 1) * CHANGELOG_PAGE_SIZE,
          page,
          pageCount,
          newerHref: page > 1 ? changelogPageHref(page - 1) : undefined,
          olderHref: page < pageCount ? changelogPageHref(page + 1) : undefined,
        }}
        searchIndex={searchIndex}
      />
    </main>
  );
}
