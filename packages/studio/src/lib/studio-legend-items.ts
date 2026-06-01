import type { LegendItem } from "@bklitui/ui/charts";
import {
  clampStudioSeriesCount,
  funnelData,
  getPieData,
  getRadarData,
  getRingData,
  pieData,
  ringData,
  STUDIO_SERIES_KEYS,
} from "@/lib/demo-data";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { getEffectiveSeriesColor } from "@/lib/studio-series-design";

export function studioCartesianLegendItems(
  state: StudioUrlState,
  seriesCount: number,
  values?: number[]
): LegendItem[] {
  const items = Array.from({ length: seriesCount }, (_, index) => ({
    label: STUDIO_SERIES_KEYS[index] ?? `Series ${index + 1}`,
    value: values?.[index] ?? 100 - index * 12,
    color: getEffectiveSeriesColor(state, index),
  }));
  const maxValue = Math.max(...items.map((item) => item.value), 1);
  return items.map((item) => ({ ...item, maxValue }));
}

export function studioPieLegendItems(
  state: StudioUrlState,
  seed = 0
): LegendItem[] {
  const slices = getPieData(seed);
  const maxValue = Math.max(...slices.map((slice) => slice.value), 1);
  return slices.map((slice, index) => ({
    label: slice.label,
    value: slice.value,
    maxValue,
    color: getEffectiveSeriesColor(state, index),
  }));
}

export function studioRingLegendItems(
  state: StudioUrlState,
  seed = 0
): LegendItem[] {
  return getRingData(seed).map((ring, index) => ({
    label: ring.label,
    value: ring.value,
    maxValue: ring.maxValue,
    color: getEffectiveSeriesColor(state, index),
  }));
}

export function studioFunnelLegendItems(state: StudioUrlState): LegendItem[] {
  const max = funnelData[0]?.value ?? 1;
  return funnelData.map((stage, index) => ({
    label: stage.label,
    value: stage.value,
    maxValue: max,
    color: getEffectiveSeriesColor(state, index),
  }));
}

export function studioRadarLegendItems(
  state: StudioUrlState,
  seed = 0
): LegendItem[] {
  return getRadarData(seed).map((series, index) => {
    const values = Object.values(series.values);
    const avg =
      values.length > 0
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : 0;
    return {
      label: series.label,
      value: Math.round(avg),
      maxValue: 100,
      color: getEffectiveSeriesColor(state, index),
    };
  });
}

export function studioStaticPieLegendItems(
  state: StudioUrlState
): LegendItem[] {
  const maxValue = Math.max(...pieData.map((slice) => slice.value), 1);
  return pieData.map((slice, index) => ({
    label: slice.label,
    value: slice.value,
    maxValue,
    color: getEffectiveSeriesColor(state, index),
  }));
}

export function studioStaticRingLegendItems(
  state: StudioUrlState
): LegendItem[] {
  return ringData.map((ring, index) => ({
    label: ring.label,
    value: ring.value,
    maxValue: ring.maxValue,
    color: getEffectiveSeriesColor(state, index),
  }));
}

export function studioAreaLegendItems(state: StudioUrlState): LegendItem[] {
  return studioCartesianLegendItems(
    state,
    clampStudioSeriesCount(state.dataSeries)
  );
}
