/** Shared Tailwind chrome for Studio editor surfaces (replaces `studio-chrome.css`). */

import { cn } from "@/lib/utils";

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
export const studioInputBackgroundClass = "bg-input";

/** Borderless scrub / slider track — matches `StudioSlider` chrome. */
export const studioScrubSurfaceClass = `${studioControlRadiusClass} ${studioInputBackgroundClass}`;

/** Standard single-line control height — matches scrub inputs and studio slider (`h-10`). */
export const studioControlHeightClass = "h-10";

/** Textarea minimum — ~2–3 rows in sidebar density. */
export const studioTextareaMinHeightClass = "min-h-[4.5rem]";

export const studioPrimitiveFocusRingClass =
  "focus-visible:border-transparent focus-visible:ring-3 focus-visible:ring-ring/50";

export const studioPrimitiveInvalidRingClass =
  "aria-invalid:border-transparent aria-invalid:ring-3 aria-invalid:ring-destructive/20";

export const studioPrimitiveDisabledClass =
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

/** Shared single-line primitive chrome (input, select trigger, default button height). */
export const studioSingleLineControlClass = cn(
  studioControlHeightClass,
  studioControlRadiusClass,
  studioInputBackgroundClass,
  "border border-transparent",
  studioPrimitiveFocusRingClass,
  studioPrimitiveInvalidRingClass,
  studioPrimitiveDisabledClass
);

/** Shared textarea chrome — taller than single-line controls. */
export const studioTextareaControlClass = cn(
  studioControlRadiusClass,
  studioInputBackgroundClass,
  studioTextareaMinHeightClass,
  "border border-transparent",
  studioPrimitiveFocusRingClass,
  studioPrimitiveInvalidRingClass,
  "disabled:cursor-not-allowed disabled:opacity-50"
);

export const studioLabelClass = "text-[var(--studio-label)]";

export const studioSectionLabelClass =
  "text-[var(--studio-section-label)] font-medium text-[11px] uppercase tracking-wider";

export const studioPreviewCanvasClass =
  "rounded-lg bg-background bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_0)] [background-size:var(--studio-canvas-grid-gap)_var(--studio-canvas-grid-gap)]";

export const studioRecordingCaptureClass =
  "bg-card bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px)] [background-size:var(--studio-canvas-grid-gap)_var(--studio-canvas-grid-gap)]";

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
  "origin-center -rotate-90 fill-none stroke-current stroke-[1.5] stroke-linecap-round [stroke-dasharray:1_0] transition-[transform] duration-[240ms] ease-[cubic-bezier(0.215,0.61,0.355,1)] group-data-pressed/toggle:rotate-90 group-has-[:checked]/legend-item:rotate-90 motion-reduce:transition-none motion-reduce:group-data-pressed/toggle:rotate-0 motion-reduce:group-has-[:checked]/legend-item:rotate-0";
