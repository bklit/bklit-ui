import { clampStudioSeriesCount, STUDIO_SERIES_KEYS } from "./demo-data";
import { getLineSeriesYAxisId, type LineYAxisId } from "./line-series-y-axis";
import type { StudioUrlState } from "./studio-parsers";
import { getEffectiveSeriesColor } from "./studio-series-design";

/** Fitted series index, clamped to the current series count. */
export function getTrendLineSeriesIndex(state: StudioUrlState): number {
  const count = clampStudioSeriesCount(state.dataSeries);
  const raw = Math.trunc(Number(state.trendLineSeries));
  if (!Number.isFinite(raw) || raw < 0) {
    return 0;
  }
  return Math.min(raw, count - 1);
}

export function getTrendLineDataKey(state: StudioUrlState): string {
  return STUDIO_SERIES_KEYS[getTrendLineSeriesIndex(state)] ?? "desktop";
}

/** Explicit colour, or the fitted series' colour when unset. */
export function getTrendLineStroke(state: StudioUrlState): string {
  return (
    state.trendLineColor ||
    getEffectiveSeriesColor(state, getTrendLineSeriesIndex(state))
  );
}

export function getTrendLineYAxisId(state: StudioUrlState): LineYAxisId {
  return getLineSeriesYAxisId(state, getTrendLineSeriesIndex(state));
}

/** Horizontal bar preview keeps its single-series categorical dataset. */
export const HORIZONTAL_BAR_TREND_LINE_DATA_KEY = "users";

/** Series picker options for the trend line `Series` control. */
export function trendLineSeriesOptions(
  state: StudioUrlState,
  chartPrefix?: string
): { value: string; label: string }[] {
  if (chartPrefix === "bar" && state.barOrientation === "horizontal") {
    return [{ value: "0", label: HORIZONTAL_BAR_TREND_LINE_DATA_KEY }];
  }
  const count = clampStudioSeriesCount(state.dataSeries);
  return STUDIO_SERIES_KEYS.slice(0, count).map((key, index) => ({
    value: String(index),
    label: key,
  }));
}
