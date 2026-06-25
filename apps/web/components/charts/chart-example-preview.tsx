import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ChartExamplePreviewLayout =
  | "cartesian"
  | "compact"
  | "wide"
  | "heatmap";

/** Preview area padding — compact charts can bleed slightly on mobile. */
export function getChartExampleContentPaddingClassName(
  layout: ChartExamplePreviewLayout = "cartesian"
) {
  if (layout === "compact") {
    return "px-2 py-0 sm:px-4";
  }

  if (layout === "heatmap") {
    return "px-3 py-4 sm:px-6 sm:py-5";
  }

  return "py-3 sm:py-4";
}

/** Override inline chart aspect on narrow viewports so demos aren't paper-thin. */
const cartesianChartMobileAspectClassName =
  "max-lg:[&_.relative.w-full]:!aspect-[3/2]";

export function getChartExamplePreviewFrameClassName(
  layout: ChartExamplePreviewLayout = "cartesian",
  previewRole: "hero" | "example" = "example"
) {
  switch (layout) {
    case "compact":
      return cn(
        "flex min-h-[240px] w-full items-center justify-center sm:min-h-[280px]",
        "[&_.relative.aspect-square]:mx-auto [&_.relative.aspect-square]:w-full",
        "[&_.relative.aspect-square]:max-w-[min(100%,300px)] sm:[&_.relative.aspect-square]:max-w-[260px]"
      );
    case "wide":
      return previewRole === "hero"
        ? "w-full min-h-[240px] aspect-video sm:min-h-[320px] sm:aspect-auto"
        : "w-full min-h-[200px] aspect-video sm:min-h-[240px] sm:aspect-auto";
    case "heatmap":
      return cn(
        "flex min-h-0 w-full items-center justify-center",
        previewRole === "hero" ? "py-2 sm:py-3" : "py-1 sm:py-2"
      );
    default:
      if (previewRole === "hero") {
        return cn(
          "min-h-[220px] w-full sm:min-h-[260px] lg:min-h-[300px]",
          cartesianChartMobileAspectClassName
        );
      }

      return cn(
        "min-h-[200px] w-full sm:min-h-[220px] lg:min-h-0",
        cartesianChartMobileAspectClassName
      );
  }
}

/** Responsive shell for gauge previews — no 300px min-width squeeze on mobile. */
export const chartExampleGaugeShellClassName =
  "w-full min-w-0 sm:mx-auto sm:max-w-md";

export const chartExampleGaugeClassName =
  "min-w-0 [&>div]:aspect-[5/4] [&>div]:sm:aspect-[21/16]";

/** Wrap fixed-size radial demos when omitting the `size` prop. */
export const chartExampleRadialShellClassName =
  "mx-auto aspect-square w-full max-w-[min(100%,300px)] sm:max-w-[260px]";

export const chartExampleCardClassName = "overflow-visible gap-0";

/** Let chart SVGs paint 3D lids, dots, and markers outside the plot box. */
export const chartExamplePreviewOverflowClassName =
  "overflow-visible [&_.relative.w-full]:overflow-visible [&_svg]:overflow-visible";

export function ChartExamplePreviewFrame({
  layout = "cartesian",
  previewRole = "example",
  children,
  className,
}: {
  layout?: ChartExamplePreviewLayout;
  previewRole?: "hero" | "example";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        getChartExamplePreviewFrameClassName(layout, previewRole),
        chartExamplePreviewOverflowClassName,
        className
      )}
    >
      {children}
    </div>
  );
}
