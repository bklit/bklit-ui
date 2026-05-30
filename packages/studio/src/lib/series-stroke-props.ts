import type { SeriesPointMarkerStyle } from "@bklitui/ui/charts";
import type { StudioUrlState } from "./studio-parsers";

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
  state: StudioUrlState
): SeriesPointMarkerStyle | undefined {
  if (!state.seriesShowMarkers) {
    return undefined;
  }

  return {
    radius: state.seriesMarkerRadius,
    ringGap: state.seriesMarkerRingGap,
    strokeWidth: state.seriesMarkerRingWidth,
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
  dataLength: number
): SeriesStrokeProps {
  const markers = seriesMarkerStyleFromState(state);
  const dashFromIndex = state.seriesDashTail
    ? resolveSeriesDashFromIndex(dataLength, state.seriesDashFromIndex)
    : undefined;

  return {
    ...(state.seriesShowMarkers ? { showMarkers: true, markers } : {}),
    ...(dashFromIndex == null
      ? {}
      : { dashFromIndex, dashArray: state.seriesDashArray }),
  };
}

export function seriesStrokePropsCodegen(state: StudioUrlState): string {
  const parts: string[] = [];

  if (state.seriesShowMarkers) {
    parts.push("showMarkers");
    const markerParts: string[] = [];
    if (state.seriesMarkerRadius !== 5) {
      markerParts.push(`radius: ${state.seriesMarkerRadius}`);
    }
    if (state.seriesMarkerRingGap !== 2) {
      markerParts.push(`ringGap: ${state.seriesMarkerRingGap}`);
    }
    if (state.seriesMarkerRingWidth !== 2) {
      markerParts.push(`strokeWidth: ${state.seriesMarkerRingWidth}`);
    }
    if (markerParts.length > 0) {
      parts.push(`markers={{ ${markerParts.join(", ")} }}`);
    }
  }

  if (state.seriesDashTail) {
    parts.push(`dashFromIndex={${state.seriesDashFromIndex}}`);
    if (state.seriesDashArray !== "6,4") {
      parts.push(`dashArray="${state.seriesDashArray}"`);
    }
  }

  return parts.length > 0 ? ` ${parts.join(" ")}` : "";
}
