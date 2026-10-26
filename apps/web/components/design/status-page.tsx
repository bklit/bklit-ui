import type { ReactNode } from "react";
import { siteContainerClassName } from "@/components/design/site-chrome";
import { StatusPageChartBackdrop } from "@/components/design/status-page-chart-backdrop-lazy";
import { cn } from "@/lib/utils";

/**
 * Full-height status layout shared by `not-found.tsx` and the error
 * boundaries: an isometric field of faded charts with a centred message.
 *
 * `code` is decorative (hidden from assistive tech); pass `srCode` to give the
 * `<h1>` an accessible prefix such as "Error 404:".
 */
export function StatusPage({
  code,
  srCode,
  title,
  description,
  actions,
  footnote,
}: {
  code: string;
  srCode?: string;
  title: ReactNode;
  description: ReactNode;
  actions: ReactNode;
  footnote?: ReactNode;
}) {
  return (
    <main className="relative isolate flex min-h-[calc(100svh-var(--site-header-height))] flex-1 flex-col overflow-hidden bg-sidebar">
      <StatusPageChartBackdrop />
      <div
        className={cn(
          siteContainerClassName,
          "flex flex-1 flex-col items-center justify-center py-16 text-center md:py-24"
        )}
      >
        <p
          aria-hidden
          className="select-none bg-linear-to-b from-foreground to-foreground/30 bg-clip-text font-bold font-heading text-[clamp(6rem,24vw,13rem)] text-transparent tabular-nums leading-[0.85] tracking-tight"
        >
          {code}
        </p>
        <h1 className="mt-6 max-w-xl text-balance font-bold font-heading text-3xl sm:text-4xl lg:text-5xl">
          {srCode ? <span className="sr-only">{srCode} </span> : null}
          {title}
        </h1>
        <p className="mt-3 max-w-md text-pretty text-muted-foreground lg:text-lg">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {actions}
        </div>
        {footnote ? (
          <p className="mt-6 font-mono text-muted-foreground text-xs">
            {footnote}
          </p>
        ) : null}
      </div>
    </main>
  );
}
