import type { StudioUrlState } from "./studio-parsers";

export const HEATMAP_STUDIO_SEPARATOR_SPACING = 12;
export const HEATMAP_STUDIO_SEPARATOR_START_OFFSET = 14;

interface HeatmapSeparatorGradientConfig {
  from: string;
  via?: string;
  to: string;
  fromOpacity?: number;
  viaOpacity?: number;
  toOpacity?: number;
}

export function studioHeatmapSeparatorGradient(
  stroke: string
): HeatmapSeparatorGradientConfig {
  return {
    from: stroke,
    via: stroke,
    to: stroke,
    fromOpacity: 0,
    viaOpacity: 1,
    toOpacity: 0,
  };
}

export function studioHeatmapSeparatorVisualProps(state: StudioUrlState): {
  stroke: string;
  strokeStyle: StudioUrlState["heatmapSeparatorStrokeStyle"];
  gradient?: HeatmapSeparatorGradientConfig;
} {
  const stroke = state.heatmapSeparatorStroke;
  return {
    stroke,
    strokeStyle: state.heatmapSeparatorStrokeStyle,
    gradient: state.heatmapSeparatorUseGradient
      ? studioHeatmapSeparatorGradient(stroke)
      : undefined,
  };
}

function heatmapSeparatorCodegenProps(state: StudioUrlState): string {
  const visual = studioHeatmapSeparatorVisualProps(state);
  return [
    `stroke="${visual.stroke}"`,
    visual.strokeStyle === "solid"
      ? null
      : `strokeStyle="${visual.strokeStyle}"`,
    visual.gradient
      ? `gradient={{ from: "${visual.gradient.from}", via: "${visual.gradient.via}", to: "${visual.gradient.to}", fromOpacity: ${visual.gradient.fromOpacity}, viaOpacity: ${visual.gradient.viaOpacity}, toOpacity: ${visual.gradient.toOpacity} }}`
      : null,
    `spacing={${HEATMAP_STUDIO_SEPARATOR_SPACING}}`,
    `startOffset={${HEATMAP_STUDIO_SEPARATOR_START_OFFSET}}`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function heatmapSeparatorCodegenBlock(state: StudioUrlState): {
  separatorImport: string;
  separatorBlock: string;
} {
  if (state.heatmapSeparatorGroupBy === "off") {
    return { separatorImport: "", separatorBlock: "" };
  }

  const strokeProps = heatmapSeparatorCodegenProps(state);
  if (state.heatmapSeparatorGroupBy === "quarter") {
    return {
      separatorImport: ", HeatmapSeparator",
      separatorBlock: `\n      <HeatmapSeparator groupBy="quarter"${state.heatmapSeparatorShowLabels ? " showLabels" : ""} labelClassName="text-black dark:text-white" ${strokeProps} />`,
    };
  }

  return {
    separatorImport: ", HeatmapSeparator",
    separatorBlock: `\n      <HeatmapSeparator every={${state.heatmapSeparatorEvery}} ${strokeProps} />`,
  };
}
