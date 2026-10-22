"use client";

import { Icon } from "@bklitui/icons";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Link from "next/link";
import {
  type ReactNode,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChangelogRail } from "@/components/changelog/changelog-rail";
import {
  SiteDivider,
  SitePageHeader,
  siteContainerClassName,
} from "@/components/design/site-chrome";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  formatChangelogDate,
  formatChangelogMonth,
} from "@/lib/changelog-format";
import { replaceUrlQuietly } from "@/lib/quiet-url";
import { cn } from "@/lib/utils";

/** Every entry, for search across all pages. */
export interface ChangelogSearchItem {
  slug: string;
  url: string;
  title: string;
  description?: string;
  date: string;
  searchText: string;
}

/** An entry on this page, with its server-rendered article. */
export interface ChangelogPageItem {
  slug: string;
  url: string;
  date: string;
  article: ReactNode;
}

export interface ChangelogPagination {
  /** Index of this page's first entry within the whole history. */
  offset: number;
  page: number;
  pageCount: number;
  newerHref?: string;
  olderHref?: string;
}

interface FeedRow {
  slug: string;
  url: string;
  date: string;
  content: ReactNode;
}

/** Reading line, as a fraction of the viewport height. */
const ANCHOR = 0.35;

const whitespacePattern = /\s+/;

export function ChangelogFeed({
  items,
  searchIndex,
  pagination,
  baseUrl,
  initialSlug,
}: {
  items: ChangelogPageItem[];
  searchIndex: ChangelogSearchItem[];
  pagination: ChangelogPagination;
  /** This route's own URL — restored when scrolled back above the feed. */
  baseUrl: string;
  /** Permalink route: open the feed at this entry. */
  initialSlug?: string;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [start, setStart] = useState(() =>
    Math.max(
      0,
      items.findIndex((item) => item.slug === initialSlug)
    )
  );

  const results = useMemo(() => {
    const terms = deferredQuery.trim().toLowerCase().split(whitespacePattern);
    return terms.some(Boolean)
      ? searchIndex.filter((item) =>
          terms.every((term) => item.searchText.includes(term))
        )
      : null;
  }, [searchIndex, deferredQuery]);
  const searching = results !== null;

  const rows: FeedRow[] = searching
    ? results.map((item) => ({
        slug: item.slug,
        url: item.url,
        date: item.date,
        content: <SearchResult item={item} />,
      }))
    : items.slice(start).map((item) => ({
        slug: item.slug,
        url: item.url,
        date: item.date,
        content: item.article,
      }));

  // Rail position spans the whole history (or the search results), so it
  // reads the same on every page.
  const firstPosition = searching ? 0 : pagination.offset + start;
  const total = searching ? results.length : searchIndex.length;

  // Scroll-spy: the entry under the reading line drives the rail, the month
  // label and the URL. -1 = still above the first entry.
  const rowRefs = useRef<(HTMLElement | null)[]>([]);
  const progress = useMotionValue(total > 1 ? firstPosition / (total - 1) : 0);
  const smoothed = useSpring(progress, {
    stiffness: 140,
    damping: 26,
    mass: 0.6,
  });
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(-1);

  const measure = useCallback(() => {
    const anchor = window.innerHeight * ANCHOR;
    const nodes = rowRefs.current.slice(0, rows.length);
    let index = -1;
    let fraction = 0;
    for (let i = 0; i < nodes.length; i++) {
      const rect = nodes[i]?.getBoundingClientRect();
      if (!rect || rect.top > anchor) {
        break;
      }
      index = i;
      fraction = Math.min(1, (anchor - rect.top) / Math.max(1, rect.height));
    }
    const position = firstPosition + Math.max(0, index) + fraction;
    progress.set(Math.min(1, position / Math.max(1, total - 1)));
    setActiveIndex(index);
  }, [firstPosition, progress, rows.length, total]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  // Keep the address bar on the entry being read (shareable as you scroll).
  const activeUrl = activeIndex >= 0 ? rows[activeIndex]?.url : undefined;
  useEffect(() => {
    replaceUrlQuietly(!searching && activeUrl ? activeUrl : baseUrl);
  }, [activeUrl, baseUrl, searching]);

  const labelRow = rows[Math.max(0, activeIndex)];
  const newerOnPage = searching ? 0 : start;

  return (
    <>
      <SitePageHeader
        actions={
          <InputGroup className="w-full sm:w-80">
            <InputGroupAddon>
              <Icon className="size-4" name="IconQuickSearch" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search the changelog"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search updates…"
              type="search"
              value={query}
            />
          </InputGroup>
        }
        description="New charts, primitives and fixes shipped to Bklit UI."
        title="Changelog"
        titleAs={initialSlug ? "p" : "h1"}
      />
      <SiteDivider />
      <div
        className={cn(
          siteContainerClassName,
          "grid gap-12 pt-10 pb-16 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16 lg:pt-16"
        )}
      >
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--site-header-height)+4rem)] h-[min(56vh,480px)]">
            <ChangelogRail
              focus={reduceMotion ? progress : smoothed}
              label={labelRow ? formatChangelogMonth(labelRow.date) : undefined}
            />
          </div>
        </aside>

        <div className="flex min-w-0 max-w-2xl flex-col">
          {newerOnPage > 0 ? (
            <Button
              className="mb-12 w-fit"
              onClick={() => setStart(0)}
              size="sm"
              variant="outline"
            >
              Show {newerOnPage} newer{" "}
              {newerOnPage === 1 ? "update" : "updates"}
            </Button>
          ) : null}

          {searching ? (
            <p className="mb-8 text-muted-foreground text-sm">
              {results.length === 0
                ? `No updates match “${deferredQuery.trim()}”.`
                : `${results.length} ${results.length === 1 ? "update" : "updates"} found`}
            </p>
          ) : null}

          <div
            className={cn(
              "flex flex-col",
              searching ? "gap-8" : "gap-20 lg:gap-28"
            )}
          >
            {rows.map((row, index) => (
              <section
                className="scroll-mt-(--site-header-height)"
                key={row.slug}
                ref={(node) => {
                  rowRefs.current[index] = node;
                }}
              >
                {row.content}
              </section>
            ))}
          </div>

          {searching ? null : <PageLinks pagination={pagination} />}
        </div>
      </div>
    </>
  );
}

function SearchResult({ item }: { item: ChangelogSearchItem }) {
  return (
    <Link className="group flex flex-col gap-1" href={item.url}>
      <time
        className="text-muted-foreground text-sm tabular-nums"
        dateTime={item.date}
      >
        {formatChangelogDate(item.date)}
      </time>
      <span className="font-heading font-semibold text-foreground text-xl group-hover:underline group-hover:underline-offset-4">
        {item.title}
      </span>
      {item.description ? (
        <span className="text-muted-foreground">{item.description}</span>
      ) : null}
    </Link>
  );
}

function PageLinks({ pagination }: { pagination: ChangelogPagination }) {
  const { newerHref, olderHref, page, pageCount } = pagination;
  if (!(newerHref || olderHref)) {
    return null;
  }

  return (
    <nav
      aria-label="Changelog pages"
      className="mt-20 flex items-center justify-between gap-4 border-border/64 border-t pt-8"
    >
      {newerHref ? (
        <Button
          render={<Link href={newerHref} rel="prev" />}
          size="sm"
          variant="ghost"
        >
          <Icon className="size-4" name="IconChevronLeft" />
          Newer
        </Button>
      ) : (
        <span />
      )}
      <span className="text-muted-foreground text-sm tabular-nums">
        Page {page} of {pageCount}
      </span>
      {olderHref ? (
        <Button
          render={<Link href={olderHref} rel="next" />}
          size="sm"
          variant="ghost"
        >
          Older
          <Icon className="size-4" name="IconChevronRight" />
        </Button>
      ) : (
        <span />
      )}
    </nav>
  );
}
