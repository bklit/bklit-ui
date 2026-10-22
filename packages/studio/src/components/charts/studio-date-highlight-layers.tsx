"use client";

import { Deadline, Weekends } from "@bklitui/ui/charts";
import { StudioVisibleLayer } from "@/components/charts/studio-chart-shell";
import type { StudioUrlState } from "@/lib/studio-parsers";

const WEEKEND_DAY_SETS: Record<StudioUrlState["weekendsDays"], number[]> = {
  "sat-sun": [6, 0],
  "fri-sat": [5, 6],
  sun: [0],
};

export function studioWeekendDays(state: StudioUrlState): number[] {
  return WEEKEND_DAY_SETS[state.weekendsDays] ?? WEEKEND_DAY_SETS["sat-sun"];
}

/** Row date nearest `deadlinePosition` (0–1) across the data's date range. */
export function studioDeadlineDate(
  state: StudioUrlState,
  data: readonly Record<string, unknown>[],
  xKey = "date"
): Date | null {
  if (data.length === 0) {
    return null;
  }
  const position = Math.min(1, Math.max(0, state.deadlinePosition));
  const index = Math.round(position * (data.length - 1));
  const value = data[index]?.[xKey];
  return value instanceof Date ? value : null;
}

/**
 * Returned as plain elements (not wrapped in a component) so the chart shell
 * unwraps `StudioVisibleLayer` and files them in the underlay layer.
 */
export function studioWeekendsLayer(
  state: StudioUrlState,
  chartPrefix: string
) {
  return (
    <StudioVisibleLayer
      componentId={`${chartPrefix}.weekends`}
      key={`${chartPrefix}.weekends`}
      state={state}
    >
      <Weekends
        align={state.weekendsAlign}
        fill={state.weekendsColor}
        fillOpacity={state.weekendsOpacity}
        fillType={state.weekendsFillType}
        patternScale={state.weekendsPatternScale}
        weekendDays={studioWeekendDays(state)}
      />
    </StudioVisibleLayer>
  );
}

export function studioDeadlineLayer(
  state: StudioUrlState,
  chartPrefix: string,
  data: readonly Record<string, unknown>[]
) {
  const date = studioDeadlineDate(state, data);
  if (!date) {
    return null;
  }
  return (
    <StudioVisibleLayer
      componentId={`${chartPrefix}.deadline`}
      key={`${chartPrefix}.deadline`}
      state={state}
    >
      <Deadline
        color={state.deadlineColor}
        date={date}
        fade={state.deadlineFade}
        fadeLength={state.deadlineFadeLength}
        fillOpacity={state.deadlineOpacity}
        fillType={state.deadlineFillType}
        label={state.deadlineLabel || undefined}
        patternScale={state.deadlinePatternScale}
        showLine={state.deadlineShowLine}
        strokeDasharray={
          state.deadlineStrokeStyle === "dashed" ? "4,4" : undefined
        }
        strokeWidth={state.deadlineStrokeWidth}
      />
    </StudioVisibleLayer>
  );
}
