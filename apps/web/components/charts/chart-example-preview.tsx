import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ChartExamplePreviewLayout = "cartesian" | "compact" | "wide";

/** Header/footer padding — consistent on all breakpoints. */
export function getChartExampleCardPaddingClassName() {
  return "px-4 sm:px-6";
}

/** Preview area padding — compact charts can bleed slightly on mobile. */
export function getChartExampleContentPaddingClassName(
  layout: ChartExamplePreviewLayout = "cartesian"
) {
  if (layout === "compact") {
    return "px-2 py-0 sm:px-6";
  }

  return cn(getChartExampleCardPaddingClassName(), "py-3 sm:py-4");
}

/** Override inline chart aspect on narrow viewports so demos aren't paper-thin. */
const cartesianChartMobileAspectClassName =
  "max-lg:[&_.relative.w-full]:!aspect-[3/2]";

export function getChartExamplePreviewFrameClassName(
  layout: ChartExamplePreviewLayout = "cartesian",
  role: "hero" | "example" = "example"
) {
  switch (layout) {
    case "compact":
      return cn(
        "flex min-h-[240px] w-full items-center justify-center sm:min-h-[280px]",
        "[&_.relative.aspect-square]:mx-auto [&_.relative.aspect-square]:w-full",
        "[&_.relative.aspect-square]:max-w-[min(100%,300px)] sm:[&_.relative.aspect-square]:max-w-[260px]"
      );
    case "wide":
      return role === "hero"
        ? "w-full min-h-[240px] aspect-video sm:min-h-[320px] sm:aspect-auto"
        : "w-full min-h-[200px] aspect-video sm:min-h-[240px] sm:aspect-auto";
    default:
      if (role === "hero") {
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

export function ChartExamplePreviewFrame({
  layout = "cartesian",
  role = "example",
  children,
  className,
}: {
  layout?: ChartExamplePreviewLayout;
  role?: "hero" | "example";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        getChartExamplePreviewFrameClassName(layout, role),
        className
      )}
    >
      {children}
    </div>
  );
}
