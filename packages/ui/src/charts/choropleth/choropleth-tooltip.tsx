"use client";

import { intFmt } from "../chart-formatters";
import { TooltipBox } from "../tooltip/tooltip-box";
import { TooltipContent, type TooltipRow } from "../tooltip/tooltip-content";
import {
  TOOLTIP_HIDE_DELAY_MS,
  useDelayedTooltipData,
} from "../tooltip/use-delayed-tooltip-data";
import {
  type ChoroplethFeature,
  useChoroplethInteraction,
  useChoroplethStable,
  useChoroplethZoom,
} from "./choropleth-context";

export interface ChoroplethTooltipProps {
  /** Custom content renderer for feature tooltips */
  content?: (props: {
    feature: ChoroplethFeature;
    index: number;
  }) => React.ReactNode;
  /** Value formatter function */
  formatValue?: (value: number) => string;
  /** Get the display name for a feature. Default: uses feature.properties.name */
  getFeatureName?: (feature: ChoroplethFeature, index: number) => string;
  /** Get the value for a feature (for display in tooltip) */
  getFeatureValue?: (
    feature: ChoroplethFeature,
    index: number
  ) => number | undefined;
  /** Label for the value row. Default: "Value" */
  valueLabel?: string;
  /** Custom class name */
  className?: string;
  /** Inline styles for the tooltip panel (background, blur, etc.). */
  panelStyle?: React.CSSProperties;
  /**
   * Tooltip panel background color (CSS variable or color value).
   * Default: `var(--chart-tooltip-background)`.
   */
  backgroundColor?: string;
  /** Fade the panel out when hover ends. Default: true */
  exit?: boolean;
  /**
   * Grace period before hiding when the pointer leaves a feature (ms).
   * Bridges border gaps so the panel springs to the next feature instead of
   * fading out and back in. Default: `120`.
   */
  hideDelay?: number;
}

export function ChoroplethTooltip({
  content,
  formatValue = intFmt,
  getFeatureName,
  getFeatureValue,
  valueLabel = "Value",
  className = "",
  panelStyle,
  backgroundColor,
  exit = true,
  hideDelay = TOOLTIP_HIDE_DELAY_MS,
}: ChoroplethTooltipProps) {
  const { containerRef, width, height, features } = useChoroplethStable();
  const { tooltipData: hoverData } = useChoroplethInteraction();
  const tooltipData = useDelayedTooltipData(hoverData, 0, hideDelay);
  const { zoom } = useChoroplethZoom();

  const feature = tooltipData ? features[tooltipData.featureIndex] : undefined;

  // Apply zoom transform to centroid position
  let x = tooltipData?.x ?? 0;
  let y = tooltipData?.y ?? 0;
  if (tooltipData && zoom) {
    const transformed = zoom.applyToPoint({ x, y });
    x = transformed.x;
    y = transformed.y;
  }

  let body: React.ReactNode = null;
  if (tooltipData && feature) {
    const index = tooltipData.featureIndex;
    if (content) {
      body = content({ feature, index });
    } else {
      const featureName = getFeatureName
        ? getFeatureName(feature, index)
        : (feature.properties?.name ?? `Feature ${index}`);
      const value = getFeatureValue?.(feature, index);
      const rows: TooltipRow[] =
        value === undefined
          ? []
          : [
              {
                color: "var(--chart-1)",
                label: valueLabel,
                value: formatValue(value),
              },
            ];
      body = <TooltipContent rows={rows} title={featureName} />;
    }
  }

  // Always mounted so the panel can fade out; `visible` drives presence.
  return (
    <TooltipBox
      backgroundColor={backgroundColor}
      className={className}
      containerHeight={height}
      containerRef={containerRef}
      containerWidth={width}
      exit={exit}
      panelStyle={panelStyle}
      visible={Boolean(tooltipData && feature)}
      x={x}
      y={y}
    >
      {body}
    </TooltipBox>
  );
}

ChoroplethTooltip.displayName = "ChoroplethTooltip";

export default ChoroplethTooltip;
