import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

export type ChartExamplePreviewLayout =
  | "cartesian"
  | "time-series"
  | "compact"
  | "funnel"
  | "wide"
  | "heatmap"
  | "inline";

/** Override inline chart aspect on narrow viewports so demos aren't paper-thin. */
const cartesianChartMobileAspectClassName =
  "max-lg:[&_.relative.w-full]:!aspect-[3/2]";

/**
 * One height for every time-series gallery preview (area, bar, line,
 * candlestick, composed, live line…): the featured area/bar charts' 4:1 on
 * desktop. Demos with a fixed inline height (candlestick, live line) drop it
 * so the shared aspect wins.
 */
const timeSeriesChartAspectClassName =
  "lg:[&_.relative.w-full]:!aspect-[4/1] [&_.relative.w-full[style*=height]]:!h-auto";

export function getChartExamplePreviewFrameClassName(
  layout: ChartExamplePreviewLayout = "cartesian",
  previewRole: "hero" | "example" = "example"
): string {
  switch (layout) {
    case "compact":
      // No min-height: the square / gauge shell sets the height, so the frame
      // hugs the chart instead of leaving dead space under short charts
      // (funnel, gauge).
      return cn(
        "flex w-full items-center justify-center",
        "[&_.relative.aspect-square]:mx-auto [&_.relative.aspect-square]:w-full",
        previewRole === "hero"
          ? "[&_.relative.aspect-square]:max-w-[min(100%,480px)] sm:[&_.relative.aspect-square]:max-w-[440px]"
          : "[&_.relative.aspect-square]:max-w-[min(100%,300px)] sm:[&_.relative.aspect-square]:max-w-[260px]"
      );
    case "funnel":
      // Phone: value labels reach the top-right corner, so clear the Replay
      // overlay with symmetric padding (keeps the funnel centered).
      return cn(
        getChartExamplePreviewFrameClassName("compact", previewRole),
        "max-sm:py-6"
      );
    case "wide":
      // Sankey / choropleth demos set their own aspect ratio, so the frame
      // hugs them (a fixed min-height left dead space under short charts).
      return "flex w-full flex-col justify-center";
    case "inline":
      // Sparklines: short rows sized by their own content, so the frame hugs
      // them instead of reserving a chart-sized box.
      return "flex w-full flex-col justify-center";
    case "heatmap":
      return cn(
        "flex min-h-0 w-full items-center justify-center",
        // Month / quarter labels run to the top-right corner (scrolled grids
        // end at the latest month): symmetric padding clears the Replay
        // overlay while keeping the grid centered.
        "py-6 sm:py-3"
      );
    default:
      return cn(
        // Column flex centers the chart if a min-height ever exceeds it.
        "flex w-full flex-col justify-center",
        // Time-series height comes from the shared aspect alone; a min-height
        // would leave a gap under the 4:1 / 3:2 chart.
        layout !== "time-series" &&
          previewRole === "hero" &&
          "min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]",
        layout !== "time-series" &&
          previewRole === "example" &&
          "min-h-[200px] sm:min-h-[220px] lg:min-h-0",
        cartesianChartMobileAspectClassName,
        layout === "time-series" && timeSeriesChartAspectClassName
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

/** Larger shell for sunburst hero previews. */
export const chartExampleSunburstHeroShellClassName =
  "mx-auto aspect-square w-full max-w-[min(100%,480px)] sm:max-w-[440px]";

export const chartExampleCardClassName = "overflow-visible gap-0";

/** Let chart SVGs paint 3D lids, dots, and markers outside the plot box. */
export const chartExamplePreviewOverflowClassName =
  "overflow-visible [&_.relative.w-full]:overflow-visible [&_svg]:overflow-visible";

export function ChartExamplePreviewFrame({
  layout = "cartesian",
  previewRole = "example",
  children,
  className,
  ref,
}: {
  layout?: ChartExamplePreviewLayout;
  previewRole?: "hero" | "example";
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      className={cn(
        getChartExamplePreviewFrameClassName(layout, previewRole),
        chartExamplePreviewOverflowClassName,
        className
      )}
      ref={ref}
    >
      {children}
    </div>
  );
}
