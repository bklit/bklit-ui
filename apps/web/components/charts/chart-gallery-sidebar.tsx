"use client";

import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";

export interface ChartGalleryAnchor {
  id: string;
  label: string;
  featured?: boolean;
}

const titleSeparatorPattern = /\s+[-–—]\s+/;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "Area Chart - Pattern Background" → "Pattern Background". */
export function chartGalleryAnchorLabel(title: string) {
  const parts = title.split(titleSeparatorPattern);
  const label = parts.length > 1 ? parts.slice(1).join(" – ") : title;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Stable, unique anchor ids for a chart page's variations (in render order). */
export function createChartGalleryAnchorIds(titles: string[]) {
  const seen = new Map<string, number>();

  return titles.map((title) => {
    const base = slugify(chartGalleryAnchorLabel(title)) || "chart";
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  });
}

/** A section is "current" once its title row crosses this fraction of the viewport. */
const ACTIVE_LINE_VIEWPORT_FRACTION = 0.35;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToAnchor(id: string, behavior: ScrollBehavior) {
  document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
}

const userScrollEvents = ["wheel", "touchstart", "keydown", "pointerdown"];

/**
 * Smooth-scroll to a section, then snap onto it once scrolling settles: charts
 * mounting along the way can differ slightly from their placeholder height.
 * Skips the correction if the user takes over scrolling.
 */
function smoothScrollToAnchor(id: string) {
  let timeoutId = 0;

  const cleanup = () => {
    window.clearTimeout(timeoutId);
    window.removeEventListener("scrollend", settle);
    for (const type of userScrollEvents) {
      window.removeEventListener(type, cleanup);
    }
  };

  function settle() {
    cleanup();
    scrollToAnchor(id, "auto");
  }

  window.addEventListener("scrollend", settle, { once: true });
  for (const type of userScrollEvents) {
    window.addEventListener(type, cleanup, { once: true, passive: true });
  }
  // Fallback for browsers without `scrollend`.
  timeoutId = window.setTimeout(settle, 1500);
  scrollToAnchor(id, "smooth");
}

/**
 * Scroll-spy for tall sections: the active anchor is the last one whose title
 * row has scrolled above the activation line (or the last one at page end).
 * fumadocs' AnchorProvider needs the whole target inside a narrow band, which
 * goes stale while a chart card taller than the band fills the viewport.
 */
function useActiveChartAnchor(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * ACTIVE_LINE_VIEWPORT_FRACTION;
      const atPageEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      let current = ids[0];

      if (atPageEnd) {
        current = ids.at(-1);
      } else {
        for (const id of ids) {
          const element = document.getElementById(id);
          if (!element || element.getBoundingClientRect().top > line) {
            break;
          }
          current = id;
        }
      }

      setActiveId(current);
    };

    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids]);

  return activeId;
}

/**
 * "On this page" rail for /charts/[chart]: lists every variation, follows the
 * one in view, and deep-links via `#id` (styled like the docs TOC rail).
 */
export function ChartGallerySidebar({
  anchors,
}: {
  anchors: ChartGalleryAnchor[];
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const idsKey = anchors.map((anchor) => anchor.id).join(" ");
  const ids = useMemo(() => idsKey.split(" "), [idsKey]);
  const activeId = useActiveChartAnchor(ids);

  // Deep links: re-apply the hash target after hydration in case layout moved.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!(id && ids.includes(id))) {
      return;
    }

    const frame = requestAnimationFrame(() => scrollToAnchor(id, "auto"));
    return () => cancelAnimationFrame(frame);
  }, [ids]);

  // Keep the active link visible inside the rail without scrolling the page.
  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(
      `[data-anchor-id="${activeId}"]`
    );
    if (!(list && link)) {
      return;
    }

    const linkTop = link.offsetTop - list.offsetTop;
    const linkBottom = linkTop + link.offsetHeight;
    if (
      linkTop < list.scrollTop ||
      linkBottom > list.scrollTop + list.clientHeight
    ) {
      list.scrollTo({
        top: linkTop - list.clientHeight / 2 + link.offsetHeight / 2,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }
  }, [activeId]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    if (prefersReducedMotion()) {
      scrollToAnchor(id, "auto");
    } else {
      smoothScrollToAnchor(id);
    }
    if (window.location.hash !== `#${id}`) {
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <nav
      aria-label="Chart variations"
      className="sticky top-[calc(var(--site-header-height)+1.5rem)] hidden max-h-[calc(100svh-var(--site-header-height)-3rem)] min-w-0 flex-col self-start lg:flex"
    >
      <p className="m-0 flex h-7 shrink-0 items-center font-medium text-foreground text-xs">
        On this page
      </p>
      <div
        className="no-scrollbar relative min-h-0 flex-1 overflow-y-auto pt-1"
        ref={listRef}
      >
        <ul className="relative m-0 ms-3.5 flex list-none flex-col gap-0.5 p-0 before:absolute before:inset-y-0 before:-left-3.25 before:w-px before:bg-border">
          {anchors.map((anchor) => {
            const isActive = anchor.id === activeId;

            return (
              <li key={anchor.id}>
                <a
                  aria-current={isActive ? "location" : undefined}
                  className="relative flex items-center gap-2 py-1 text-[0.8125rem] text-sidebar-foreground leading-4.5 no-underline transition-colors before:absolute before:inset-y-px before:-left-3.25 before:w-px before:rounded-full hover:text-foreground data-[active=true]:text-foreground data-[active=true]:before:w-0.5 data-[active=true]:before:bg-primary"
                  data-active={isActive}
                  data-anchor-id={anchor.id}
                  href={`#${anchor.id}`}
                  onClick={(event) => handleClick(event, anchor.id)}
                >
                  <span className="min-w-0 truncate">{anchor.label}</span>
                  {anchor.featured ? (
                    <span className="shrink-0 rounded-sm border px-1 py-px font-medium text-[0.625rem] text-muted-foreground uppercase leading-none tracking-wide">
                      Featured
                    </span>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
