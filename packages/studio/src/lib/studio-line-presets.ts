import { studioStateHref } from "./chart-links";
import { defaultStudioState, type StudioUrlState } from "./studio-parsers";

/** Canonical line-chart Studio preset for reference area + projection demos. */
export function lineReferenceProjectionStudioState(
  overrides: Partial<StudioUrlState> = {}
): StudioUrlState {
  return defaultStudioState({
    chart: "line-chart",
    dataPoints: 10,
    referenceAreaY1: 250,
    referenceAreaY2: 300,
    referenceAreaPattern: "diagonal",
    referenceAreaPatternColor: "oklch(0.76 0.144 180.392 / 0.17)",
    referenceAreaPatternScale: 0.75,
    referenceAreaPatternStrokeWidth: 1.5,
    referenceAreaStroke: "oklch(0.841 0.142 159.667 / 0.49)",
    referenceAreaAxisLabelColor: "oklch(0.795 0.152 164.722)",
    referenceAreaShowMarkers: false,
    projectionCount: 2,
    projectionSeriesIndices: "0|0",
    projectionModes: "target|auto",
    projectionHorizons: "6|6",
    projectionEndValues: "301",
    projectionCurves: "bezier|bezier",
    projectionStrokes: "var(--chart-3)|oklch(0.926 0.128 32.86 / 0.73)",
    projectionStrokeStyles: "gradient|gradient",
    projectionStrokeGradientStarts:
      "oklch(0.979 0.037 110.273)|oklch(0.926 0.128 16.866 / 0.73)",
    projectionStrokeGradientEnds:
      "oklch(0.59 0.17 166.38)|oklch(0.849 0.232 16.498)",
    projectionDashArrays: "1,4|1,4",
    hiddenComponents:
      "line.yaxis.left|line.yaxis.right|line.brush|line.series.1|line.legend",
    ...overrides,
  });
}

export function studioLineReferenceProjectionHref(): string {
  return studioStateHref(lineReferenceProjectionStudioState());
}
