/** Shared Tailwind chrome for Studio editor surfaces (replaces `studio-chrome.css`). */

/**
 * shadcn radius scale (`studio-tailwind.css` maps these to `--radius`):
 * - `rounded-lg` → `--radius-lg` → `var(--radius)` — default control chrome
 * - `rounded-md` → `--radius-md` — inner thumbs / nested pills
 * - `rounded-sm` → `--radius-sm` — compact nested elements
 */
export const studioControlRadiusClass = "rounded-lg";
export const studioControlRadiusInnerClass = "rounded-md";
export const studioControlRadiusCompactClass = "rounded-sm";

/** Scrub fields, sliders, and motion curve chrome. */
export const studioInputBackgroundClass =
  "bg-[var(--studio-input-background,var(--background))]";

/** Borderless scrub / slider track — matches `StudioSlider` chrome. */
export const studioScrubSurfaceClass = `${studioControlRadiusClass} ${studioInputBackgroundClass}`;

export const studioLabelClass = "text-[var(--studio-label)]";

export const studioSectionLabelClass =
  "text-[var(--studio-section-label)] font-medium text-[11px] uppercase tracking-wider";

export const studioPreviewCanvasClass =
  "rounded-lg bg-background bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_0)] [background-size:20px_20px]";

export const studioRecordingCaptureClass =
  "bg-card bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px)] [background-size:20px_20px]";

export const studioMotionSectionClass = "max-w-full min-w-0";

/** Motion curve editor canvas — same surface as scrub inputs. */
export const studioMotionCurveCardClass = studioInputBackgroundClass;

export const studioSidebarScrollClass =
  "[--studio-scrollbar-width:4px] [scrollbar-gutter:stable] [&::-webkit-scrollbar-track]:my-1.5";

export const studioCartesianFillClass =
  "[&>div]:!aspect-auto [&>div]:h-full [&>div]:min-h-0 [&>div]:w-full";

/**
 * Joined toggle grids — `gap-px` + `bg-muted/20` draws subtle 1px gutters between cells.
 */
export const studioJoinedToggleGroupClass =
  "isolate w-full !gap-px overflow-hidden rounded-lg border border-transparent bg-muted/20";

/** Flat cell inside `studioJoinedToggleGroupClass` — square corners, no outer ring. */
export const studioJoinedToggleGroupItemClass =
  "min-w-0 !rounded-none !border-0 bg-background shadow-none outline-none ring-0 hover:bg-muted hover:text-foreground aria-pressed:bg-muted data-pressed:bg-muted focus-visible:relative focus-visible:z-10 focus-visible:!border-0 focus-visible:!ring-0";

export const studioLegendRingPathClass =
  "origin-center -rotate-90 fill-none stroke-[color-mix(in_oklch,var(--muted-foreground)_70%,transparent)] stroke-[1.5] stroke-linecap-round [stroke-dasharray:0.028_0.055] [stroke-dashoffset:0] transition-[stroke,stroke-dasharray,stroke-dashoffset,transform] duration-[180ms,220ms,220ms,240ms] ease-[ease,cubic-bezier(0.215,0.61,0.355,1),cubic-bezier(0.215,0.61,0.355,1),cubic-bezier(0.215,0.61,0.355,1)] group-data-pressed/toggle:rotate-90 group-data-pressed/toggle:stroke-foreground group-data-pressed/toggle:[stroke-dasharray:1_0] group-data-pressed/toggle:[stroke-dashoffset:0] motion-reduce:transition-none motion-reduce:group-data-pressed/toggle:rotate-0";
