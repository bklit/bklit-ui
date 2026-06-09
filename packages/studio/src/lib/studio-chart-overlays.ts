import type { ChartLegendProps, ChartTooltipProps } from "@bklitui/ui/charts";
import { cn } from "@bklitui/ui/lib/utils";
import type { CSSProperties } from "react";
import type { StudioUrlState } from "@/lib/studio-parsers";

export function studioTooltipPanelStyle(
  state: StudioUrlState
): CSSProperties | undefined {
  const opacity = state.tooltipBackgroundOpacity;
  const blur = state.tooltipBlur;
  if (opacity === 0.8 && blur === 12) {
    return undefined;
  }
  return {
    backgroundColor: `color-mix(in oklch, var(--chart-tooltip-background) ${Math.round(opacity * 100)}%, transparent)`,
    backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
    WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
  };
}

export function chartTooltipCodegenProps(state: StudioUrlState): string {
  const parts: string[] = [];

  if (state.crosshairStyle === "dashed") {
    parts.push(`indicatorDasharray="${state.crosshairDashArray}"`);
  }
  if (state.crosshairFadeEdges !== "both") {
    parts.push(`indicatorFadeEdges="${state.crosshairFadeEdges}"`);
  }
  if (state.crosshairFadeLength !== 10) {
    parts.push(`indicatorFadeLength={${state.crosshairFadeLength}}`);
  }
  if (state.tooltipMatchCrosshair) {
    parts.push("matchCrosshair");
  }
  if (!state.tooltipMatchCrosshair && state.tooltipDamping !== 20) {
    parts.push(`damping={${state.tooltipDamping}}`);
  }

  return parts.length > 0 ? `\n          ${parts.join("\n          ")}` : "";
}

export function chartTooltipPropsFromState(
  state: StudioUrlState,
  overrides: Partial<ChartTooltipProps> = {}
): ChartTooltipProps {
  const panelStyle = studioTooltipPanelStyle(state);
  const indicatorDasharray =
    state.crosshairStyle === "dashed" ? state.crosshairDashArray : undefined;
  const indicatorFadeEdges =
    state.crosshairFadeEdges === "both" ? undefined : state.crosshairFadeEdges;
  const indicatorFadeLength =
    state.crosshairFadeLength === 10 ? undefined : state.crosshairFadeLength;
  const matchCrosshair = state.tooltipMatchCrosshair ? true : undefined;
  const damping =
    state.tooltipMatchCrosshair || state.tooltipDamping === 20
      ? undefined
      : state.tooltipDamping;

  return {
    showCrosshair: state.showCrosshair,
    showDots: state.showTooltipDots,
    showDatePill: state.showTooltipDatePill,
    indicatorColor: state.crosshairColor,
    indicatorDasharray,
    indicatorFadeEdges,
    indicatorFadeLength,
    matchCrosshair,
    damping,
    panelStyle,
    ...overrides,
  };
}

export function studioLegendClassName(state: StudioUrlState): string {
  const horizontal = state.legendLayout === "horizontal";
  return cn(
    "max-w-full px-2",
    horizontal ? "w-full" : "w-auto",
    state.legendLayout === "horizontal" && "flex-row flex-wrap gap-x-4 gap-y-2"
  );
}

export function studioLegendTypographyStyle(
  state: StudioUrlState
): CSSProperties {
  return { fontSize: state.legendFontSize };
}

export function chartLegendPropsFromState(
  state: StudioUrlState,
  overrides: Partial<ChartLegendProps> = {}
): Partial<ChartLegendProps> {
  const horizontal = state.legendLayout === "horizontal";
  return {
    showProgress: state.legendShowProgress,
    showMarker: state.legendShowMarker,
    showValue: state.legendShowValue,
    className: studioLegendClassName(state),
    itemClassName: horizontal ? "w-auto shrink-0" : "",
    labelClassName: "font-medium tabular-nums",
    valueClassName: "tabular-nums opacity-80",
    ...overrides,
  };
}

export function studioLegendWrapperStyle(state: StudioUrlState): CSSProperties {
  return { fontSize: state.legendFontSize };
}
