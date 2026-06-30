import type { StudioUrlState } from "@/lib/studio-parsers";

/** Applied when switching to the sunburst chart in Studio. */
export const sunburstChartDefaults: Partial<StudioUrlState> = {
  showLegend: true,
  legendPlacement: "bottom",
  legendAlign: "center",
  legendLayout: "horizontal",
  pieSize: 100,
};
