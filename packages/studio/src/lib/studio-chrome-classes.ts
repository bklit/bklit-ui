/** Shared Tailwind chrome for Studio editor surfaces (replaces `studio-chrome.css`). */

export const studioLabelClass = "text-[var(--studio-label)]";

export const studioSectionLabelClass =
  "text-[var(--studio-section-label)] font-medium text-[11px] uppercase tracking-wider";

export const studioPreviewCanvasClass =
  "rounded-lg bg-background bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_0)] [background-size:20px_20px]";

export const studioRecordingCaptureClass =
  "bg-card bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px)] [background-size:20px_20px]";

export const studioMotionSectionClass = "max-w-full min-w-0";

export const studioMotionCurveCardClass =
  "bg-card bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px)] [background-size:10px_10px]";

export const studioSidebarScrollClass =
  "[--studio-scrollbar-width:4px] [scrollbar-gutter:stable] [&::-webkit-scrollbar-track]:my-1.5";

export const studioCartesianFillClass =
  "[&>div]:!aspect-auto [&>div]:h-full [&>div]:min-h-0 [&>div]:w-full";

/**
 * Joined toggle grids — `gap-px` + `bg-border` draws 1px gutters; the shell owns
 * the outer ring so adjacent cells never stack double borders.
 */
export const studioJoinedToggleGroupClass =
  "isolate w-full !gap-px overflow-hidden rounded-lg border border-border bg-border";

/** Flat cell inside `studioJoinedToggleGroupClass` — square corners, no outer ring. */
export const studioJoinedToggleGroupItemClass =
  "min-w-0 !rounded-none !border-0 bg-background shadow-none outline-none ring-0 hover:bg-muted hover:text-foreground aria-pressed:bg-muted data-pressed:bg-muted focus-visible:relative focus-visible:z-10 focus-visible:!border-0 focus-visible:!ring-0";

export const studioLegendRingPathClass =
  "origin-center -rotate-90 fill-none stroke-[color-mix(in_oklch,var(--muted-foreground)_70%,transparent)] stroke-[1.5] stroke-linecap-round [stroke-dasharray:0.028_0.055] [stroke-dashoffset:0] transition-[stroke,stroke-dasharray,stroke-dashoffset,transform] duration-[180ms,220ms,220ms,240ms] ease-[ease,cubic-bezier(0.215,0.61,0.355,1),cubic-bezier(0.215,0.61,0.355,1),cubic-bezier(0.215,0.61,0.355,1)] group-data-pressed/toggle:rotate-90 group-data-pressed/toggle:stroke-foreground group-data-pressed/toggle:[stroke-dasharray:1_0] group-data-pressed/toggle:[stroke-dashoffset:0] motion-reduce:transition-none motion-reduce:group-data-pressed/toggle:rotate-0";
