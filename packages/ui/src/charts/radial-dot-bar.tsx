"use client";

import { memo, type ReactNode, useId, useMemo } from "react";
import {
  type PatternPresetId,
  patternPresetTileSize,
  renderPatternPreset,
} from "./pattern-preset";
import { radialLabelFontSize } from "./radial-axis";
import {
  type RadialSeries,
  radialNumberAt,
  useRadialChart,
} from "./radial-chart";
import {
  computeRadialDotGrid,
  createRadialRowScale,
  type RadialDotLayout,
  type RadialDotSlot,
  radialDotRowRadius,
  stackRadialRows,
} from "./radial-dot-bar-layout";
import { polarToCartesian } from "./radial-geometry";
import { radialSeriesColor } from "./radial-series-color";

/**
 * Pattern fill for a series' (or the ghost layer's) dots, built from the
 * shared pattern presets (`renderPatternPreset`).
 */
export interface RadialDotPattern {
  /** Pattern preset. Default: "diagonal" */
  preset?: PatternPresetId;
  /**
   * Custom fill instead of a preset — e.g. `url(#my-pattern)` for a pattern
   * you render yourself. Ignores `preset`, `color`, `scale` and `units`.
   */
  fill?: string;
  /** Stripe / dot color. Default: the series color */
  color?: string;
  /** Pattern tile scale (1 = preset size). Default: 1 */
  scale?: number;
  /** Stripe stroke width in px. Default: preset width × scale */
  strokeWidth?: number;
  /** Tile background behind the stripes. Default: none (transparent) */
  background?: string;
  /** Ring around each dot so patterned dots read as circles. Default: `color`; "none" hides it */
  stroke?: string;
  /** Ring width in px. Default: 1 */
  ringWidth?: number;
  /**
   * - `dot`: the tile is fitted to each dot so every dot shows the same,
   *   centred stripes.
   * - `chart`: one continuous texture across the chart, seen through the dots.
   * Default: "dot"
   */
  units?: "dot" | "chart";
}

export interface RadialDotBarAnnotation {
  /** Bin index the label points at */
  index: number;
  label: string;
  /**
   * Text color. Default: the first `emphasize` series' color, else the
   * color of the series at the bin's tip
   */
  color?: string;
}

export interface RadialDotBarProps {
  /**
   * Datum key of a comparison value (e.g. yesterday's total), drawn as dim
   * "ghost" dots in bins where no series has a value (the rest of the day).
   */
  ghostDataKey?: string;
  /** Ghost dot color. Default: var(--foreground) */
  ghostColor?: string;
  /** Ghost dot opacity. Default: 0.22 */
  ghostOpacity?: number;
  /** Value mapped to the outermost row. Default: largest stack / ghost value */
  maxValue?: number;
  /** Concentric rows across the value band. Default: 14 */
  rows?: number;
  /** Dot placement on each row. Default: "grid" (even density) */
  layout?: RadialDotLayout;
  /** Dot diameter as a fraction of the row spacing. Default: 0.44 */
  dotSize?: number;
  /** Ghost dot diameter as a fraction of the row spacing. Default: 0.26 */
  ghostDotSize?: number;
  /** Fraction of the rows over which `rampFrom` series reach full opacity. Default: 0.5 */
  rampExtent?: number;
  /** Callout labels outside a bin's tip */
  annotations?: RadialDotBarAnnotation[];
  /** Opacity of other series while a legend item is hovered. Default: 0.2 */
  fadedOpacity?: number;
  /**
   * Pattern fills keyed by series `dataKey` (use `"ghost"` for the ghost
   * layer). Pass a preset id (e.g. `"diagonal"`) or a {@link RadialDotPattern}.
   * Series without an entry stay solid.
   */
  patterns?: Record<string, PatternPresetId | RadialDotPattern>;
}

const ENTER_SPREAD_S = 0.75;
const ENTER_ROW_STEP_S = 0.03;
const ENTER_DURATION_S = 0.36;

interface DotSpec {
  key: string;
  x: number;
  y: number;
  r: number;
  opacity: number;
  delay: number;
}

interface DotGroup {
  key: string;
  /** Series index, or -1 for the ghost layer */
  seriesIndex: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  dots: DotSpec[];
}

interface ResolvedDotFill {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  /** Ring inset so the outer edge of the ring matches the dot size */
  inset: number;
  defs: ReactNode;
}

/** Largest tile count ≥ 1 that keeps the tile near the preset size. */
function fitTileCount(diameter: number, tile: number): number {
  return Math.max(1, Math.round(diameter / Math.max(0.5, tile)));
}

function resolveDotFill({
  pattern,
  color,
  id,
  diameter,
}: {
  pattern: PatternPresetId | RadialDotPattern | undefined;
  color: string;
  id: string;
  diameter: number;
}): ResolvedDotFill {
  if (pattern === undefined || pattern === "none") {
    return { fill: color, inset: 0, defs: null };
  }
  const spec: RadialDotPattern =
    typeof pattern === "string" ? { preset: pattern } : pattern;
  const patternColor = spec.color ?? color;
  const stroke = spec.stroke ?? patternColor;
  const ringWidth = stroke === "none" ? 0 : (spec.ringWidth ?? 1);
  const ring = {
    stroke: ringWidth > 0 ? stroke : undefined,
    strokeWidth: ringWidth > 0 ? ringWidth : undefined,
    inset: ringWidth / 2,
  };
  if (spec.fill) {
    return { fill: spec.fill, defs: null, ...ring };
  }
  const preset = spec.preset ?? "diagonal";
  if (preset === "none") {
    return { fill: patternColor, defs: null, ...ring };
  }
  const baseScale = spec.scale ?? 1;
  const options = {
    color: patternColor,
    strokeWidth: spec.strokeWidth,
    tileBackground: spec.background,
  };
  if ((spec.units ?? "dot") === "chart" || diameter <= 0) {
    return {
      fill: `url(#${id})`,
      defs: renderPatternPreset(preset, id, { ...options, scale: baseScale }),
      ...ring,
    };
  }
  // Fit a whole number of tiles across the dot, then re-anchor the tile to
  // each dot's bounding box so every dot shows identical, centred stripes.
  const tile = patternPresetTileSize(preset, baseScale).width;
  const count = fitTileCount(diameter, tile);
  const scale = (baseScale * diameter) / (count * tile);
  const baseId = `${id}-base`;
  return {
    fill: `url(#${id})`,
    defs: (
      <>
        {renderPatternPreset(preset, baseId, { ...options, scale })}
        <defs>
          <pattern
            height={1 / count}
            href={`#${baseId}`}
            id={id}
            patternUnits="objectBoundingBox"
            width={1 / count}
            x={0}
            y={0}
          />
        </defs>
      </>
    ),
    ...ring,
  };
}

const DotGroups = memo(function DotGroups({
  groups,
  revealed,
  animate,
  hoveredSeries,
  fadedOpacity,
}: {
  groups: DotGroup[];
  revealed: boolean;
  animate: boolean;
  hoveredSeries: number | null;
  fadedOpacity: number;
}) {
  return (
    <g pointerEvents="none">
      {groups.map((group) => {
        const dimmed =
          hoveredSeries !== null && hoveredSeries !== group.seriesIndex;
        return (
          <g
            fill={group.fill}
            key={group.key}
            stroke={group.stroke}
            strokeWidth={group.strokeWidth}
            style={{
              opacity: dimmed ? fadedOpacity : 1,
              transition: "opacity 0.15s ease-out",
            }}
          >
            {group.dots.map((dot) => (
              <circle
                cx={dot.x}
                cy={dot.y}
                key={dot.key}
                r={dot.r}
                style={{
                  opacity: revealed ? dot.opacity : 0,
                  transform: revealed ? undefined : "scale(0)",
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transition: animate
                    ? `opacity ${ENTER_DURATION_S}s ease-out ${dot.delay}s, transform ${ENTER_DURATION_S}s cubic-bezier(0.2, 0.8, 0.2, 1) ${dot.delay}s`
                    : undefined,
                }}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
});

/**
 * Default annotation color: the first `emphasize` series, else the topmost
 * series with dots in the annotated bin.
 */
function annotationSeriesColor(
  series: RadialSeries[],
  ends: number[] | undefined
): string {
  let index = series.findIndex((s) => s.emphasize);
  if (index < 0 && ends) {
    for (let i = ends.length - 1; i >= 0; i--) {
      if ((ends[i] ?? 0) > (i > 0 ? (ends[i - 1] ?? 0) : 0)) {
        index = i;
        break;
      }
    }
  }
  return radialSeriesColor(series[index], Math.max(0, index));
}

/**
 * Radial dot bars for {@link RadialChart}: every bin is a stacked column of
 * dots on concentric rows (innermost series first), cascading outward on
 * enter like `BarSquares`. A radial scale keeps the dot count proportional to
 * the value with the default `grid` layout.
 */
export function RadialDotBar({
  ghostDataKey,
  ghostColor = "var(--foreground)",
  ghostOpacity = 0.22,
  maxValue: maxValueProp,
  rows = 14,
  layout = "grid",
  dotSize = 0.44,
  ghostDotSize = 0.26,
  rampExtent = 0.5,
  annotations,
  fadedOpacity = 0.2,
  patterns,
}: RadialDotBarProps) {
  const patternIdBase = `radial-dot-pattern-${useId().replace(/:/g, "")}`;
  const {
    data,
    series,
    binCount,
    radius,
    layout: ringLayout,
    innerRadius,
    outerRadius,
    futureBins,
    hoveredSeries,
    revealed,
    animate,
    binAngle,
  } = useRadialChart();

  const maxValue = useMemo(() => {
    if (maxValueProp !== undefined) {
      return maxValueProp;
    }
    let max = 0;
    data.forEach((d, i) => {
      const value = futureBins[i]
        ? ((ghostDataKey ? radialNumberAt(d, ghostDataKey) : 0) ?? 0)
        : series.reduce(
            (sum, s) => sum + Math.max(0, radialNumberAt(d, s.dataKey) ?? 0),
            0
          );
      max = Math.max(max, value);
    });
    return max;
  }, [maxValueProp, data, series, futureBins, ghostDataKey]);

  const spacing = rows > 0 ? (outerRadius - innerRadius) / rows : 0;

  const grid = useMemo(
    () =>
      computeRadialDotGrid({
        binCount,
        baseRadius: innerRadius,
        spacing,
        rows,
        layout,
      }),
    [binCount, innerRadius, spacing, rows, layout]
  );

  const toRows = useMemo(
    () =>
      createRadialRowScale({
        maxValue,
        baseRadius: innerRadius,
        spacing,
        rows,
      }),
    [maxValue, innerRadius, spacing, rows]
  );

  /** Exclusive end row of each series per bin (future bins: the ghost). */
  const stackEnds = useMemo(
    () =>
      data.map((d, i) => {
        if (futureBins[i]) {
          const ghost = ghostDataKey
            ? (radialNumberAt(d, ghostDataKey) ?? 0)
            : 0;
          return stackRadialRows([ghost], toRows, rows);
        }
        return stackRadialRows(
          series.map((s) => radialNumberAt(d, s.dataKey) ?? 0),
          toRows,
          rows
        );
      }),
    [data, futureBins, ghostDataKey, series, toRows, rows]
  );

  const fills = useMemo(() => {
    const dotDiameter = spacing * dotSize;
    const seriesFills = series.map((s, seriesIndex) =>
      resolveDotFill({
        pattern: patterns?.[s.dataKey],
        color: radialSeriesColor(s, seriesIndex),
        id: `${patternIdBase}-${seriesIndex}`,
        diameter: dotDiameter,
      })
    );
    const ghostFill = resolveDotFill({
      pattern: patterns?.ghost,
      color: ghostColor,
      id: `${patternIdBase}-ghost`,
      diameter: spacing * ghostDotSize,
    });
    return { series: seriesFills, ghost: ghostFill };
  }, [
    spacing,
    dotSize,
    ghostDotSize,
    series,
    patterns,
    ghostColor,
    patternIdBase,
  ]);

  const groups = useMemo((): DotGroup[] => {
    if (spacing <= 0) {
      return [];
    }
    const seriesGroups: DotGroup[] = series.map((s, seriesIndex) => {
      const f = fills.series[seriesIndex];
      return {
        key: `series-${s.dataKey}`,
        seriesIndex,
        fill: f?.fill ?? radialSeriesColor(s, seriesIndex),
        stroke: f?.stroke,
        strokeWidth: f?.strokeWidth,
        dots: [],
      };
    });
    const ghostGroup: DotGroup = {
      key: "ghost",
      seriesIndex: -1,
      fill: fills.ghost.fill,
      stroke: fills.ghost.stroke,
      strokeWidth: fills.ghost.strokeWidth,
      dots: [],
    };
    const seriesR = series.map((_, i) =>
      Math.max(0, (spacing * dotSize) / 2 - (fills.series[i]?.inset ?? 0))
    );
    const ghostR = Math.max(
      0,
      (spacing * ghostDotSize) / 2 - fills.ghost.inset
    );
    const rampRows = Math.max(1, rows * rampExtent);

    const seriesDot = (slot: RadialDotSlot, ends: number[]) => {
      const seriesIndex = ends.findIndex((end) => slot.row < end);
      const s = series[seriesIndex];
      const group = seriesGroups[seriesIndex];
      if (!(s && group)) {
        return null;
      }
      const rampFrom = s.rampFrom ?? 1;
      const ramp = rampFrom + (1 - rampFrom) * Math.min(1, slot.row / rampRows);
      return {
        group,
        r: seriesR[seriesIndex] ?? 0,
        opacity: (s.opacity ?? 1) * ramp,
      };
    };

    grid.forEach((slots, bin) => {
      const ends = stackEnds[bin] ?? [];
      const binDelay = (bin / Math.max(1, binCount)) * ENTER_SPREAD_S;
      for (const slot of slots) {
        let target: { group: DotGroup; r: number; opacity: number } | null =
          null;
        if (futureBins[bin]) {
          target =
            (ends[0] ?? 0) > slot.row
              ? { group: ghostGroup, r: ghostR, opacity: ghostOpacity }
              : null;
        } else {
          target = seriesDot(slot, ends);
        }
        target?.group.dots.push({
          key: `${bin}-${slot.row}-${slot.angle.toFixed(4)}`,
          x: slot.x,
          y: slot.y,
          r: target.r,
          opacity: target.opacity,
          delay: binDelay + slot.row * ENTER_ROW_STEP_S,
        });
      }
    });

    return [ghostGroup, ...seriesGroups];
  }, [
    spacing,
    series,
    ghostColor,
    dotSize,
    ghostDotSize,
    rows,
    rampExtent,
    grid,
    stackEnds,
    binCount,
    futureBins,
    ghostOpacity,
    fills,
  ]);

  const fontSize = radialLabelFontSize(radius);

  return (
    <g>
      {fills.ghost.defs}
      {fills.series.map((f, i) => (
        <g key={series[i]?.dataKey ?? i}>{f.defs}</g>
      ))}
      <DotGroups
        animate={animate}
        fadedOpacity={fadedOpacity}
        groups={groups}
        hoveredSeries={hoveredSeries}
        revealed={revealed}
      />
      {annotations?.map((annotation) => {
        const ends = stackEnds[annotation.index];
        const annotationColor =
          annotation.color ?? annotationSeriesColor(series, ends);
        const tipRow = Math.max(0, (ends?.at(-1) ?? 1) - 1);
        const tipRadius = radialDotRowRadius(innerRadius, spacing, tipRow);
        const angle = binAngle(annotation.index);
        const p = polarToCartesian(
          angle,
          Math.max(
            tipRadius + spacing * 2.5,
            radius * ringLayout.axisLabel * 1.02
          )
        );
        const sin = Math.sin(angle);
        let anchor: "start" | "middle" | "end" = "middle";
        if (sin > 0.25) {
          anchor = "start";
        } else if (sin < -0.25) {
          anchor = "end";
        }
        return (
          <text
            className="font-mono"
            dominantBaseline="central"
            fill={annotationColor}
            fontSize={fontSize}
            key={`annotation-${annotation.index}-${annotation.label}`}
            pointerEvents="none"
            style={{
              opacity: revealed ? 1 : 0,
              transition: animate
                ? `opacity 0.4s ease-out ${ENTER_SPREAD_S}s`
                : undefined,
            }}
            textAnchor={anchor}
            x={p.x}
            y={p.y}
          >
            {annotation.label}
          </text>
        );
      })}
    </g>
  );
}

RadialDotBar.displayName = "RadialDotBar";

export default RadialDotBar;
