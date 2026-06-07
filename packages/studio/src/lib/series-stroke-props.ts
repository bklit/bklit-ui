import type { SeriesPointMarkerStyle } from "@bklitui/ui/charts";
import type { StudioUrlState } from "./studio-parsers";
import {
  getSeriesDashArray,
  getSeriesDashFromIndex,
  getSeriesDashTail,
  getSeriesMarkerRadius,
  getSeriesMarkerRingGap,
  getSeriesMarkerRingWidth,
  getSeriesShowMarkers,
} from "./studio-series-line-props";

export function resolveSeriesDashFromIndex(
  dataLength: number,
  index: number
): number | undefined {
  if (dataLength < 2) {
    return undefined;
  }
  return Math.max(0, Math.min(index, dataLength - 2));
}

export function seriesMarkerStyleFromState(
  state: StudioUrlState,
  seriesIndex = 0
): SeriesPointMarkerStyle | undefined {
  if (!getSeriesShowMarkers(state, seriesIndex)) {
    return undefined;
  }

  return {
    radius: getSeriesMarkerRadius(state, seriesIndex),
    ringGap: getSeriesMarkerRingGap(state, seriesIndex),
    strokeWidth: getSeriesMarkerRingWidth(state, seriesIndex),
  };
}

export interface SeriesStrokeProps {
  showMarkers?: boolean;
  markers?: SeriesPointMarkerStyle;
  dashFromIndex?: number;
  dashArray?: string;
}

export function seriesStrokePropsFromState(
  state: StudioUrlState,
  dataLength: number,
  seriesIndex = 0
): SeriesStrokeProps {
  const markers = seriesMarkerStyleFromState(state, seriesIndex);
  const dashFromIndex = getSeriesDashTail(state, seriesIndex)
    ? resolveSeriesDashFromIndex(
        dataLength,
        getSeriesDashFromIndex(state, seriesIndex)
      )
    : undefined;
  const dashArray = getSeriesDashArray(state, seriesIndex);

  return {
    ...(getSeriesShowMarkers(state, seriesIndex)
      ? { showMarkers: true, markers }
      : {}),
    ...(dashFromIndex == null ? {} : { dashFromIndex, dashArray }),
  };
}

export function seriesStrokePropsCodegen(
  state: StudioUrlState,
  seriesIndex = 0
): string {
  const parts: string[] = [];

  if (getSeriesShowMarkers(state, seriesIndex)) {
    parts.push("showMarkers");
    const markerParts: string[] = [];
    const radius = getSeriesMarkerRadius(state, seriesIndex);
    const ringGap = getSeriesMarkerRingGap(state, seriesIndex);
    const ringWidth = getSeriesMarkerRingWidth(state, seriesIndex);
    if (radius !== 5) {
      markerParts.push(`radius: ${radius}`);
    }
    if (ringGap !== 2) {
      markerParts.push(`ringGap: ${ringGap}`);
    }
    if (ringWidth !== 2) {
      markerParts.push(`strokeWidth: ${ringWidth}`);
    }
    if (markerParts.length > 0) {
      parts.push(`markers={{ ${markerParts.join(", ")} }}`);
    }
  }

  if (getSeriesDashTail(state, seriesIndex)) {
    parts.push(`dashFromIndex={${getSeriesDashFromIndex(state, seriesIndex)}}`);
    if (dashArrayDiffers(state, seriesIndex)) {
      parts.push(`dashArray="${getSeriesDashArray(state, seriesIndex)}"`);
    }
  }

  return parts.length > 0 ? ` ${parts.join(" ")}` : "";
}

function dashArrayDiffers(state: StudioUrlState, seriesIndex: number): boolean {
  return getSeriesDashArray(state, seriesIndex) !== "6,4";
}
