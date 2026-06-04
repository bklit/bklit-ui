import { clampStudioSeriesCount } from "@/lib/demo-data";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { parsePipeField, serializePipeField } from "@/lib/studio-series-design";

export const LINE_Y_AXIS_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
] as const;

export type LineYAxisId = (typeof LINE_Y_AXIS_OPTIONS)[number]["value"];

const DEFAULT_AXIS: LineYAxisId = "left";

export function parseLineSeriesYAxes(state: StudioUrlState): LineYAxisId[] {
  const parsed = parsePipeField(state.lineSeriesYAxes);
  return parsed.map((part) => (part === "right" ? "right" : "left"));
}

export function getLineSeriesYAxisId(
  state: StudioUrlState,
  seriesIndex: number
): LineYAxisId {
  const axes = parseLineSeriesYAxes(state);
  return axes[seriesIndex] ?? DEFAULT_AXIS;
}

export function buildLineSeriesYAxesUpdate(
  state: StudioUrlState,
  seriesIndex: number,
  axisId: LineYAxisId
): string {
  const count = clampStudioSeriesCount(state.dataSeries);
  const current = parseLineSeriesYAxes(state);
  const next = Array.from({ length: count }, (_, index) => {
    const existing = current[index] ?? DEFAULT_AXIS;
    return index === seriesIndex ? axisId : existing;
  });
  return serializePipeField(next);
}

export function lineChartUsesRightYAxis(state: StudioUrlState): boolean {
  const count = clampStudioSeriesCount(state.dataSeries);
  for (let index = 0; index < count; index += 1) {
    if (getLineSeriesYAxisId(state, index) === "right") {
      return true;
    }
  }
  return false;
}
