import type { StudioUrlState } from "@/lib/studio-parsers";

export interface StudioChartGridLayout {
  gridTemplateColumns: string;
  gridTemplateRows: string;
  /** CSS grid-area for the legend (row / column), e.g. "1 / 3". */
  legendGridArea: string;
  chartGridArea: "2 / 2";
}

/** 3×3 grid: chart in center; legend in one peripheral cell; empty tracks collapse to 0. */
export function studioChartGridLayout(
  state: Pick<StudioUrlState, "legendPlacement" | "legendAlign">,
  legendVisible: boolean
): StudioChartGridLayout {
  if (!legendVisible) {
    return {
      gridTemplateColumns: "0 minmax(0, 1fr) 0",
      gridTemplateRows: "0 minmax(0, 1fr) 0",
      legendGridArea: "1 / 1",
      chartGridArea: "2 / 2",
    };
  }

  let columns = "0 minmax(0, 1fr) 0";
  if (state.legendAlign === "start") {
    columns = "auto minmax(0, 1fr) 0";
  } else if (state.legendAlign === "end") {
    columns = "0 minmax(0, 1fr) auto";
  }

  const rows =
    state.legendPlacement === "top"
      ? "auto minmax(0, 1fr) 0"
      : "0 minmax(0, 1fr) auto";

  let legendCol = 2;
  if (state.legendAlign === "start") {
    legendCol = 1;
  } else if (state.legendAlign === "end") {
    legendCol = 3;
  }
  const legendRow = state.legendPlacement === "top" ? 1 : 3;

  return {
    gridTemplateColumns: columns,
    gridTemplateRows: rows,
    legendGridArea: `${legendRow} / ${legendCol}`,
    chartGridArea: "2 / 2",
  };
}

export function studioLegendGridCellClassName(
  state: Pick<
    StudioUrlState,
    "legendPlacement" | "legendAlign" | "legendLayout"
  >
): string {
  const horizontal = state.legendLayout === "horizontal";
  const placement = state.legendPlacement;
  const align = state.legendAlign;

  return [
    "flex min-h-0 min-w-0 max-w-full",
    horizontal ? "flex-row flex-wrap gap-x-4 gap-y-2" : "flex-col",
    placement === "top" ? "self-end" : "self-start",
    align === "start" && "justify-self-start",
    align === "center" && "justify-self-center",
    align === "end" && "justify-self-end",
  ]
    .filter(Boolean)
    .join(" ");
}
