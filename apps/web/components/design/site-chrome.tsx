/**
 * Site chrome primitives — page container, edge lines, and section dividers.
 *
 * Adapted from coss ui (https://coss.com/ui, MIT): the container rails with
 * small square "rivets" where horizontal dividers meet them.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared max-width container for marketing + gallery pages and the header. */
export const siteContainerClassName =
  "mx-auto w-full max-w-[1336px] px-4 lg:px-6";

/** Small square marker that sits on the vertical rails. */
const rivetBefore =
  "before:absolute before:-left-[11.5px] before:z-1 before:-ml-1 before:size-2 before:rounded-[2px] before:border before:border-border before:bg-popover before:bg-clip-padding before:shadow-xs/5 dark:before:bg-clip-border";
const rivetAfter =
  "after:absolute after:-right-[11.5px] after:z-1 after:-mr-1 after:size-2 after:rounded-[2px] after:border after:border-border after:bg-background after:bg-clip-padding after:shadow-xs/5 dark:after:bg-clip-border";

/**
 * Vertical rail lines drawn 12px outside a `siteContainerClassName` element.
 * Shared by the page rails and the header so both land on the same pixels.
 */
export const siteRailsClassName =
  "before:pointer-events-none before:absolute before:inset-y-0 before:-left-3 before:w-px before:bg-border/64 after:pointer-events-none after:absolute after:inset-y-0 after:-right-3 after:w-px after:bg-border/64";

/** Vertical rails on both sides of the page container (render inside a `relative` wrapper). */
export function SiteEdgeLines() {
  return (
    <div
      aria-hidden
      className={cn(
        siteContainerClassName,
        siteRailsClassName,
        "pointer-events-none absolute inset-0 z-40"
      )}
    />
  );
}

/** Rivets where the fixed header's bottom edge meets the rails. */
export function SiteHeaderRivets() {
  return (
    <div
      aria-hidden
      className={cn(
        siteContainerClassName,
        "pointer-events-none fixed inset-x-0 top-0 z-50 h-(--site-header-height)",
        rivetBefore,
        rivetAfter,
        "before:bottom-[-3.5px] after:bottom-[-3.5px]"
      )}
    />
  );
}

/** Full-bleed hairline with rivets at the container rails. */
export function SiteDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative h-px w-full bg-border/64 max-sm:bg-border/48",
        className
      )}
    >
      <div
        className={cn(
          siteContainerClassName,
          "pointer-events-none absolute inset-x-0 top-0 z-41",
          rivetBefore,
          rivetAfter,
          "before:top-[-3.5px] after:top-[-3.5px]"
        )}
      />
    </div>
  );
}

/** coss-style page header: left-aligned heading, muted lead, actions. */
export function SitePageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
  headingClassName,
  titleAs: Title = "h1",
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
  headingClassName?: string;
  /** Use `"p"` when the page's `h1` lives further down (e.g. a permalink). */
  titleAs?: "h1" | "p";
}) {
  return (
    <section className={cn(siteContainerClassName, className)}>
      <div className="flex max-w-2xl flex-col items-start gap-2 py-8 md:py-12 lg:py-16 xl:gap-4">
        {eyebrow}
        <Title
          className={cn(
            "text-balance font-bold font-heading text-4xl lg:text-5xl",
            headingClassName
          )}
        >
          {title}
        </Title>
        {description ? (
          <p className="text-pretty text-muted-foreground lg:text-lg">
            {description}
          </p>
        ) : null}
        {actions ? (
          <div className="mt-2 flex flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}

/** Section heading used between framed blocks on the home page. */
export function SiteSectionHeader({
  title,
  description,
  titleId,
  className,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  titleId?: string;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between md:pb-8",
        className
      )}
    >
      <div className="flex max-w-2xl flex-col gap-1.5">
        <h2
          className="text-balance font-bold font-heading text-2xl lg:text-3xl"
          id={titleId}
        >
          {title}
        </h2>
        {description ? (
          <p className="text-pretty text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
