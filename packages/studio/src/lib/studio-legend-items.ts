import type { LegendItem, SankeyData } from "@bklitui/ui/charts";
import {
  clampStudioSeriesCount,
  funnelData,
  getPieData,
  getRadarData,
  getRingData,
  getSankeyData,
  pieData,
  ringData,
  STUDIO_SERIES_KEYS,
} from "@/lib/demo-data";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { getEffectiveSeriesColor } from "@/lib/studio-series-design";

export function studioCartesianLegendItems(
  state: StudioUrlState,
  seriesCount: number,
  values?: number[],
  chartPrefix?: string
): LegendItem[] {
  const visibleIndices = Array.from(
    { length: seriesCount },
    (_, index) => index
  ).filter(
    (index) =>
      chartPrefix == null ||
      isStudioComponentVisible(state, `${chartPrefix}.series.${index}`)
  );
  const items = visibleIndices.map((index) => ({
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
    clampStudioSeriesCount(state.dataSeries),
    undefined,
    "area"
  );
}

function sankeyNodeDisplayValue(nodeIndex: number, data: SankeyData): number {
  const node = data.nodes[nodeIndex];
  if (!node) {
    return 0;
  }
  let displayValue = 0;
  for (const link of data.links) {
    if (node.category === "source" && link.source === nodeIndex) {
      displayValue += link.value;
    } else if (node.category !== "source" && link.target === nodeIndex) {
      displayValue += link.value;
    }
  }
  return displayValue;
}

export function studioSankeyLegendItems(
  state: StudioUrlState,
  seed = 0
): LegendItem[] {
  const data = getSankeyData(seed);
  const values = data.nodes.map((_, index) =>
    sankeyNodeDisplayValue(index, data)
  );
  const maxValue = Math.max(...values, 1);
  return data.nodes.map((node, index) => ({
    label: node.name,
    value: values[index] ?? 0,
    maxValue,
    color: getEffectiveSeriesColor(state, index),
  }));
}

export function studioCandlestickLegendItems(
  state: StudioUrlState
): LegendItem[] {
  const bullishColor = state.candleUseGradient
    ? "var(--chart-1)"
    : getEffectiveSeriesColor(state, 0);
  const bearishColor = state.candleUseGradient
    ? "var(--chart-3)"
    : getEffectiveSeriesColor(state, 1);
  return [
    { label: "Bullish", value: 100, color: bullishColor },
    { label: "Bearish", value: 100, color: bearishColor },
  ];
}
