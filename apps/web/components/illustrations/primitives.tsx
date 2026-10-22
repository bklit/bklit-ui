/**
 * Building blocks for chart/component illustrations.
 *
 * Visual language adapted from coss ui's category thumbnails
 * (https://github.com/cosscom/coss — apps/ui/components/category-thumbnails.tsx, MIT).
 * Abstract, monochrome mini-UI drawings: muted-foreground at varying opacity,
 * rounded shapes, subtle card shells with inner highlights, and at most one
 * primary accent driven by the `--btn-from` / `--btn-to` vars set by the card.
 */
import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

/** Placeholder text line. */
export function Text({
  className,
  variant = "main",
}: {
  className?: string;
  variant?: "main" | "secondary";
}) {
  return (
    <div
      className={cn(
        "h-1.5 shrink-0 rounded-full",
        variant === "main"
          ? "bg-muted-foreground/40"
          : "bg-muted-foreground/20",
        className
      )}
    />
  );
}

/** Small colored dot (legend marker, series swatch). */
export function Dot({
  className,
  accent = false,
}: {
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "size-2 shrink-0 rounded-full",
        accent
          ? "bg-linear-to-b from-(--btn-from) to-(--btn-to)"
          : "bg-muted-foreground/40",
        className
      )}
    />
  );
}

/** Standalone card shell used inside illustrations (not the registry Card). */
export function ThumbCard({
  children,
  className,
  withGradient = true,
}: {
  children: ReactNode;
  className?: string;
  withGradient?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full max-w-48 flex-col rounded-2xl border not-dark:bg-clip-padding text-card-foreground shadow-md/5 before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-2xl)-1px)] before:shadow-[0_-1px_--theme(--color-white/6%),0_1px_--theme(--color-black/6%)]",
        withGradient
          ? "bg-linear-to-b from-[color-mix(in_srgb,var(--card)_96%,var(--color-white))] to-[color-mix(in_srgb,var(--card)_99%,var(--color-black))] dark:to-[color-mix(in_srgb,var(--card)_98%,var(--color-white))]"
          : "bg-card/99 dark:bg-card",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ThumbPanel({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex-1 p-4", className)}>{children}</div>;
}

/** Card header row: title line + small secondary line on the right. */
export function ThumbHeader({
  titleWidth = "w-[40%]",
}: {
  titleWidth?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Text className={titleWidth} />
      <Text className="w-5" variant="secondary" />
    </div>
  );
}

const VIEWBOX_SEPARATOR = /[\s,]+/;

/**
 * Decorative SVG. Draws in `currentColor` (muted-foreground by default) so
 * shapes pick opacity via `fillOpacity` / `strokeOpacity`. Children may set
 * `className="text-primary"` for the single accent.
 */
export function ThumbSvg({
  className,
  children,
  style,
  ...props
}: SVGProps<SVGSVGElement>) {
  // Lock the box to the viewBox ratio so the SVG's height always follows its
  // width. Without it, an SVG with only a width (e.g. inside a flex row) can
  // fall back to the 150px replaced-element default height in some engines
  // (Safari/WebKit) and blow up the card.
  const [, , vbWidth = 0, vbHeight = 0] =
    props.viewBox?.split(VIEWBOX_SEPARATOR).map(Number) ?? [];
  const aspectRatio =
    props.preserveAspectRatio !== "none" && vbWidth > 0 && vbHeight > 0
      ? `${vbWidth} / ${vbHeight}`
      : undefined;
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "h-auto w-full min-w-0 overflow-visible text-muted-foreground",
        className
      )}
      fill="none"
      focusable="false"
      style={aspectRatio ? { aspectRatio, ...style } : style}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Vertical fade (currentColor) for area fills. */
export function FadeGradient({
  id,
  from = 0.32,
}: {
  id: string;
  from?: number;
}) {
  return (
    <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor="currentColor" stopOpacity={from} />
      <stop offset="1" stopColor="currentColor" stopOpacity={0} />
    </linearGradient>
  );
}

// ---------------------------------------------------------------------------
// Geometry helpers (angles in degrees, 0 = 12 o'clock, clockwise)
// ---------------------------------------------------------------------------

export function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {
    x: Math.round((cx + r * Math.cos(rad)) * 100) / 100,
    y: Math.round((cy + r * Math.sin(rad)) * 100) / 100,
  };
}

/** Annular sector path (or pie wedge when `inner` is 0). */
export function arcPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number
) {
  const large = end - start > 180 ? 1 : 0;
  const o0 = polar(cx, cy, outer, start);
  const o1 = polar(cx, cy, outer, end);
  if (inner <= 0) {
    return `M${cx} ${cy}L${o0.x} ${o0.y}A${outer} ${outer} 0 ${large} 1 ${o1.x} ${o1.y}Z`;
  }
  const i0 = polar(cx, cy, inner, end);
  const i1 = polar(cx, cy, inner, start);
  return `M${o0.x} ${o0.y}A${outer} ${outer} 0 ${large} 1 ${o1.x} ${o1.y}L${i0.x} ${i0.y}A${inner} ${inner} 0 ${large} 0 ${i1.x} ${i1.y}Z`;
}

/** Open arc stroke path. */
export function strokeArc(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number
) {
  const large = end - start > 180 ? 1 : 0;
  const a = polar(cx, cy, r, start);
  const b = polar(cx, cy, r, end);
  return `M${a.x} ${a.y}A${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}
