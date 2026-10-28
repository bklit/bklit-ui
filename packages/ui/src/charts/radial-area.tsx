"use client";

import {
  areaRadial,
  type CurveFactory,
  curveBasis,
  curveBasisClosed,
  curveCatmullRom,
  curveCatmullRomClosed,
  curveLinear,
  curveLinearClosed,
  lineRadial,
} from "d3-shape";
import {
  animate as animateValue,
  type MotionValue,
  type SpringOptions,
  useMotionValue,
} from "motion/react";
import { memo, useEffect, useId, useMemo, useRef } from "react";
import {
  createRadialEdgeLookup,
  type RadialDotMotion,
  type RadialEdgeLookup,
  RadialHoverDot,
  radialNumberAt,
  useRadialChart,
  useRadialDotAngle,
} from "./radial-chart";
import { createRadialScale, radialWedgePath } from "./radial-geometry";
import { radialSeriesColor } from "./radial-series-color";

export type RadialAreaCurve = "catmullRom" | "basis" | "linear";

export type RadialAreaStroke = "outer" | "both" | "none";

export interface RadialAreaProps {
  /**
   * Draw a single area for this datum key (it need not be a chart series;
   * a matching series supplies color, opacity and legend dimming). Omit to
   * draw every chart series.
   */
  dataKey?: string;
  /** Inner edge of a single area — e.g. a min/max band. Default: the band base (0) */
  baseDataKey?: string;
  /** Series mode: stack series outward (true) or overlay them from the base. Default: true */
  stacked?: boolean;
  /** Fill / stroke color for a single area. Default: the series color (else its palette slot), else var(--foreground) */
  color?: string;
  /** Draw the fill. Default: true (false gives an outline-only line) */
  fill?: boolean;
  /** Fill opacity at the outer edge. Default: 0.32 */
  fillOpacity?: number;
  /**
   * Radial gradient: fraction of `fillOpacity` at the band base, rising to
   * the full value at the outer radius. Default: the series' `rampFrom`, else 0.25
   */
  rampFrom?: number;
  /** Which edges get a stroke. Default: "outer" */
  stroke?: RadialAreaStroke;
  /** Stroke width in px. Default: 1.5 */
  strokeWidth?: number;
  /** Stroke opacity. Default: 1 */
  strokeOpacity?: number;
  /** e.g. "4 4" for a dashed line */
  strokeDasharray?: string;
  /** Curve through the bin centers (closed when every bin has a value). Default: "catmullRom" */
  curve?: RadialAreaCurve;
  /**
   * Datum key of a comparison value (e.g. yesterday's total), drawn as a dim
   * "ghost" area with a dashed edge in bins where no series has a value.
   */
  ghostDataKey?: string;
  /** Ghost color. Default: var(--foreground) */
  ghostColor?: string;
  /** Ghost fill opacity (its stroke is twice this). Default: 0.1 */
  ghostOpacity?: number;
  /**
   * Value mapped to the outer radius. Default: the chart's shared scale when
   * `RadialChart` has `maxValue`, else the largest drawn value
   */
  maxValue?: number;
  /** Dot on the outer edge of the hovered bin, riding the edge. Default: true */
  activeDot?: boolean;
  /**
   * How the active dot follows the pointer: locked to the crosshair (the
   * `RadialScrubber` spring), its own spring (`activeDotSpring`) or snapping
   * to the bin. Reduced motion always snaps. Default: "crosshair"
   */
  activeDotMotion?: RadialDotMotion;
  /** `activeDotMotion="spring"`: the dot's spring. Default: `{ stiffness: 240, damping: 24 }` */
  activeDotSpring?: SpringOptions;
  /** Opacity of other series while a legend item is hovered. Default: 0.2 */
  fadedOpacity?: number;
}

const CURVES: Record<
  RadialAreaCurve,
  { open: CurveFactory; closed: CurveFactory }
> = {
  catmullRom: { open: curveCatmullRom, closed: curveCatmullRomClosed },
  basis: { open: curveBasis, closed: curveBasisClosed },
  linear: { open: curveLinear, closed: curveLinearClosed },
};

/** Clockwise sweep — matches `RadialDotBar`'s cascade. */
const ENTER_SPREAD_S = 0.75;
/** Rise time of each bin from the band base. */
const ENTER_DURATION_S = 0.5;
const ENTER_TOTAL_S = ENTER_SPREAD_S + ENTER_DURATION_S;

interface AreaPoint {
  angle: number;
  /** Bin index (drives the enter delay) */
  index: number;
  inner: number;
  outer: number;
}

interface AreaLayer {
  key: string;
  /** Series index, -1 when not a series, -2 for the ghost */
  seriesIndex: number;
  color: string;
  fill: boolean;
  fillOpacity: number;
  rampFrom: number;
  stroke: RadialAreaStroke;
  strokeOpacity: number;
  strokeDasharray?: string;
  /** Contiguous runs of points; `closed` runs wrap the full turn */
  runs: { points: AreaPoint[]; closed: boolean }[];
  /** Runs the edge strokes follow (stacked series skip zero-height bins) */
  strokeRuns: { points: AreaPoint[]; closed: boolean }[];
  /** Stroked point per bin (null where there is no edge) for the active dot */
  byBin: (AreaPoint | null)[];
}

interface RawLayer {
  key: string;
  seriesIndex: number;
  values: ({ lo: number; hi: number } | null)[];
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Split per-bin points into runs; extend open runs to their bin edges. */
function toRuns(
  points: (AreaPoint | null)[],
  binStartAngle: (index: number) => number,
  isFullCircle: boolean
): AreaLayer["runs"] {
  if (isFullCircle && points.length > 0 && points.every((p) => p !== null)) {
    return [{ points: points as AreaPoint[], closed: true }];
  }
  const runs: AreaLayer["runs"] = [];
  let current: AreaPoint[] = [];
  const flush = () => {
    const first = current[0];
    const last = current.at(-1);
    if (first && last) {
      runs.push({
        closed: false,
        points: [
          { ...first, angle: binStartAngle(first.index) },
          ...current,
          { ...last, angle: binStartAngle(last.index + 1) },
        ],
      });
    }
    current = [];
  };
  for (const p of points) {
    if (p) {
      current.push(p);
    } else {
      flush();
    }
  }
  flush();
  return runs;
}

/** Points at enter progress `p` (0–1): each bin rises from the base after a clockwise delay. */
function grow(
  points: AreaPoint[],
  p: number,
  base: number,
  binCount: number
): AreaPoint[] {
  if (p >= 1) {
    return points;
  }
  const t = p * ENTER_TOTAL_S;
  return points.map((point) => {
    const delay = (point.index / Math.max(1, binCount)) * ENTER_SPREAD_S;
    const e = easeOutCubic(
      Math.min(1, Math.max(0, (t - delay) / ENTER_DURATION_S))
    );
    return {
      ...point,
      inner: base + (point.inner - base) * e,
      outer: base + (point.outer - base) * e,
    };
  });
}

/** Enter clip: a wedge sweeping from the start angle to the end angle. */
function wedgePath(
  p: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const t = Math.min(1, (p * ENTER_TOTAL_S) / ENTER_SPREAD_S);
  if (t >= 1 - 1e-4) {
    // Whole disc once the sweep is done (also covers partial arcs).
    return `M0,${-r}A${r},${r},0,1,1,0,${r}A${r},${r},0,1,1,0,${-r}Z`;
  }
  return radialWedgePath(
    r,
    startAngle,
    startAngle + (endAngle - startAngle) * t
  );
}

/** Keep an attribute in sync with the enter progress without re-rendering. */
function useProgressAttribute<T extends SVGElement>(
  progress: MotionValue<number>,
  attribute: string,
  compute: (p: number) => string
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const apply = (p: number) =>
      ref.current?.setAttribute(attribute, compute(p));
    apply(progress.get());
    return progress.on("change", apply);
  }, [progress, attribute, compute]);
  return ref;
}

const AreaLayerPaths = memo(function AreaLayerPaths({
  layer,
  progress,
  curve,
  base,
  binCount,
  gradientId,
}: {
  layer: AreaLayer;
  progress: MotionValue<number>;
  curve: RadialAreaCurve;
  base: number;
  binCount: number;
  gradientId: string;
}) {
  const paths = useMemo(() => {
    const factories = CURVES[curve];
    const build = (kind: "area" | "outer" | "inner", p: number): string =>
      (kind === "area" ? layer.runs : layer.strokeRuns)
        .map(({ points, closed }) => {
          const factory = closed ? factories.closed : factories.open;
          const grown = grow(points, p, base, binCount);
          if (kind === "area") {
            return (
              areaRadial<AreaPoint>()
                .angle((d) => d.angle)
                .innerRadius((d) => d.inner)
                .outerRadius((d) => d.outer)
                .curve(factory)(grown) ?? ""
            );
          }
          return (
            lineRadial<AreaPoint>()
              .angle((d) => d.angle)
              .radius((d) => (kind === "outer" ? d.outer : d.inner))
              .curve(factory)(grown) ?? ""
          );
        })
        .join("");
    return {
      area: (p: number) => build("area", p),
      outer: (p: number) => build("outer", p),
      inner: (p: number) => build("inner", p),
    };
  }, [layer, curve, base, binCount]);

  const areaRef = useProgressAttribute<SVGPathElement>(
    progress,
    "d",
    paths.area
  );
  const outerRef = useProgressAttribute<SVGPathElement>(
    progress,
    "d",
    paths.outer
  );
  const innerRef = useProgressAttribute<SVGPathElement>(
    progress,
    "d",
    paths.inner
  );
  const p = progress.get();

  return (
    <>
      {layer.fill ? (
        <path
          d={paths.area(p)}
          fill={`url(#${gradientId})`}
          fillRule="evenodd"
          ref={areaRef}
        />
      ) : null}
      {layer.stroke === "none" ? null : (
        <g
          fill="none"
          stroke={layer.color}
          strokeDasharray={layer.strokeDasharray}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity={layer.strokeOpacity}
        >
          <path d={paths.outer(p)} ref={outerRef} />
          {layer.stroke === "both" ? (
            <path d={paths.inner(p)} ref={innerRef} />
          ) : null}
        </g>
      )}
    </>
  );
});

function EnterClip({
  id,
  progress,
  radius,
  startAngle,
  endAngle,
}: {
  id: string;
  progress: MotionValue<number>;
  radius: number;
  startAngle: number;
  endAngle: number;
}) {
  const r = radius * 1.2;
  const compute = useMemo(
    () => (p: number) => wedgePath(p, r, startAngle, endAngle),
    [r, startAngle, endAngle]
  );
  const ref = useProgressAttribute<SVGPathElement>(progress, "d", compute);
  return (
    <clipPath id={id}>
      <path d={compute(progress.get())} ref={ref} />
    </clipPath>
  );
}

/**
 * Radial areas for {@link RadialChart} (d3 `areaRadial`): every chart series
 * stacked or overlaid from the band base, or a single `dataKey` area —
 * optionally a band between `baseDataKey` and `dataKey`. A smooth curve runs
 * through the bin centers and closes on itself when every bin has a value.
 * On enter the areas sweep in clockwise, each bin rising from the base.
 * The active dot rides each outer edge, locked to the crosshair by default
 * (`activeDotMotion`).
 */
export function RadialArea({
  dataKey,
  baseDataKey,
  stacked = true,
  color,
  fill = true,
  fillOpacity = 0.32,
  rampFrom,
  stroke = "outer",
  strokeWidth = 1.5,
  strokeOpacity = 1,
  strokeDasharray,
  curve = "catmullRom",
  ghostDataKey,
  ghostColor = "var(--foreground)",
  ghostOpacity = 0.1,
  maxValue: maxValueProp,
  activeDot = true,
  activeDotMotion = "crosshair",
  activeDotSpring,
  fadedOpacity = 0.2,
}: RadialAreaProps) {
  const {
    data,
    series,
    binCount,
    radius,
    innerRadius,
    outerRadius,
    futureBins,
    hoveredIndex,
    hoveredSeries,
    revealed,
    animate,
    binAngle,
    binStartAngle,
    isFullCircle,
    startAngle,
    endAngle,
    sharedValueScale,
    valueScale,
  } = useRadialChart();

  const uid = useId().replace(/:/g, "");
  const clipId = `radial-area-clip-${uid}`;

  // Raw values per layer (before scaling) ------------------------------------
  const raw = useMemo(() => {
    const layers: RawLayer[] = [];
    if (dataKey) {
      layers.push({
        key: `area-${dataKey}`,
        seriesIndex: series.findIndex((s) => s.dataKey === dataKey),
        values: data.map((d) => {
          const hi = radialNumberAt(d, dataKey);
          if (hi === null) {
            return null;
          }
          const lo = baseDataKey ? (radialNumberAt(d, baseDataKey) ?? 0) : 0;
          return { lo: Math.max(0, lo), hi: Math.max(0, hi) };
        }),
      });
    } else {
      const cumulative = data.map(() => 0);
      series.forEach((s, seriesIndex) => {
        layers.push({
          key: `series-${s.dataKey}`,
          seriesIndex,
          values: data.map((d, i) => {
            const v = radialNumberAt(d, s.dataKey);
            if (v === null) {
              return null;
            }
            const lo = stacked ? (cumulative[i] ?? 0) : 0;
            const hi = lo + Math.max(0, v);
            if (stacked) {
              cumulative[i] = hi;
            }
            return { lo, hi };
          }),
        });
      });
    }
    const ghost = ghostDataKey
      ? data.map((d, i) =>
          futureBins[i]
            ? (() => {
                const v = radialNumberAt(d, ghostDataKey);
                return v === null ? null : { lo: 0, hi: Math.max(0, v) };
              })()
            : null
        )
      : null;
    return { layers, ghost };
  }, [dataKey, baseDataKey, stacked, series, data, ghostDataKey, futureBins]);

  const maxValue = useMemo(() => {
    if (maxValueProp !== undefined) {
      return maxValueProp;
    }
    let max = 0;
    for (const layer of raw.layers) {
      for (const v of layer.values) {
        max = Math.max(max, v?.hi ?? 0);
      }
    }
    for (const v of raw.ghost ?? []) {
      max = Math.max(max, v?.hi ?? 0);
    }
    return max;
  }, [maxValueProp, raw]);

  const layers = useMemo((): AreaLayer[] => {
    if (outerRadius <= innerRadius) {
      return [];
    }
    const own = createRadialScale({ maxValue, innerRadius, outerRadius });
    const scale =
      maxValueProp === undefined && sharedValueScale
        ? valueScale
        : (value: number) => own(value) ?? innerRadius;
    const toPoints = (values: ({ lo: number; hi: number } | null)[]) =>
      values.map((v, index): AreaPoint | null =>
        v
          ? {
              index,
              angle: binAngle(index),
              inner: scale(v.lo),
              outer: scale(v.hi),
            }
          : null
      );

    const result: AreaLayer[] = [];
    if (raw.ghost) {
      const byBin = toPoints(raw.ghost);
      result.push({
        key: "ghost",
        seriesIndex: -2,
        color: ghostColor,
        fill: true,
        fillOpacity: ghostOpacity,
        rampFrom: 0.4,
        stroke: "outer",
        strokeOpacity: Math.min(1, ghostOpacity * 2.5),
        strokeDasharray: "3 4",
        runs: toRuns(byBin, binStartAngle, isFullCircle),
        strokeRuns: toRuns(byBin, binStartAngle, isFullCircle),
        byBin,
      });
    }
    for (const layer of raw.layers) {
      const s = series[layer.seriesIndex];
      const points = toPoints(layer.values);
      // A zero-height stacked series would trace the stack top it sits on.
      const byBin =
        dataKey || !stacked
          ? points
          : points.map((p) => (p && p.outer > p.inner ? p : null));
      result.push({
        key: layer.key,
        seriesIndex: layer.seriesIndex,
        color:
          (dataKey ? color : undefined) ??
          radialSeriesColor(s, layer.seriesIndex),
        fill,
        fillOpacity: fillOpacity * (s?.opacity ?? 1),
        rampFrom: rampFrom ?? s?.rampFrom ?? 0.25,
        stroke,
        strokeOpacity: strokeOpacity * (s?.opacity ?? 1),
        strokeDasharray,
        runs: toRuns(points, binStartAngle, isFullCircle),
        strokeRuns: toRuns(byBin, binStartAngle, isFullCircle),
        byBin,
      });
    }
    return result;
  }, [
    raw,
    series,
    maxValue,
    maxValueProp,
    sharedValueScale,
    valueScale,
    innerRadius,
    outerRadius,
    binAngle,
    binStartAngle,
    isFullCircle,
    dataKey,
    stacked,
    color,
    fill,
    fillOpacity,
    rampFrom,
    stroke,
    strokeOpacity,
    strokeDasharray,
    ghostColor,
    ghostOpacity,
  ]);

  // Enter progress -----------------------------------------------------------
  const progress = useMotionValue(animate ? 0 : 1);
  useEffect(() => {
    if (!animate) {
      progress.jump(1);
      return;
    }
    if (!revealed) {
      return;
    }
    const controls = animateValue(progress, 1, {
      duration: ENTER_TOTAL_S,
      ease: "linear",
    });
    return () => controls.stop();
  }, [animate, revealed, progress]);

  // Outer edge per layer, for the active dot to ride.
  const edges = useMemo(() => {
    const result = new Map<string, RadialEdgeLookup>();
    if (!activeDot) {
      return result;
    }
    const factories = CURVES[curve];
    for (const layer of layers) {
      if (layer.stroke === "none") {
        continue;
      }
      result.set(
        layer.key,
        createRadialEdgeLookup((context) => {
          for (const { points, closed } of layer.strokeRuns) {
            lineRadial<AreaPoint>()
              .angle((d) => d.angle)
              .radius((d) => d.outer)
              .curve(closed ? factories.closed : factories.open)
              .context(context)(points);
          }
        })
      );
    }
    return result;
  }, [activeDot, layers, curve]);
  const dotAngle = useRadialDotAngle(activeDotMotion, activeDotSpring);

  const dotR = Math.max(2.5, radius * 0.009);

  return (
    <g pointerEvents="none">
      <defs>
        <EnterClip
          endAngle={endAngle}
          id={clipId}
          progress={progress}
          radius={radius}
          startAngle={startAngle}
        />
        {layers.map((layer) => (
          <radialGradient
            cx={0}
            cy={0}
            gradientUnits="userSpaceOnUse"
            id={`radial-area-fill-${uid}-${layer.key}`}
            key={layer.key}
            r={outerRadius}
          >
            <stop
              offset={innerRadius / outerRadius}
              stopColor={layer.color}
              stopOpacity={layer.fillOpacity * layer.rampFrom}
            />
            <stop
              offset={1}
              stopColor={layer.color}
              stopOpacity={layer.fillOpacity}
            />
          </radialGradient>
        ))}
      </defs>
      <g clipPath={`url(#${clipId})`} strokeWidth={strokeWidth}>
        {layers.map((layer) => {
          const dimmed =
            hoveredSeries !== null && hoveredSeries !== layer.seriesIndex;
          return (
            <g
              key={layer.key}
              style={{
                opacity: dimmed ? fadedOpacity : 1,
                transition: "opacity 0.15s ease-out",
              }}
            >
              <AreaLayerPaths
                base={innerRadius}
                binCount={binCount}
                curve={curve}
                gradientId={`radial-area-fill-${uid}-${layer.key}`}
                layer={layer}
                progress={progress}
              />
            </g>
          );
        })}
      </g>
      {activeDot && hoveredIndex !== null
        ? layers.map((layer) => {
            const lookup = edges.get(layer.key);
            if (!(lookup && layer.byBin[hoveredIndex])) {
              return null;
            }
            const dimmed =
              hoveredSeries !== null && hoveredSeries !== layer.seriesIndex;
            return (
              <RadialHoverDot
                angle={dotAngle}
                fill={layer.color}
                key={`dot-${layer.key}`}
                lookup={lookup}
                opacity={dimmed ? fadedOpacity : 1}
                r={dotR}
                stroke="var(--background)"
                strokeWidth={1.5}
              />
            );
          })
        : null}
    </g>
  );
}

RadialArea.displayName = "RadialArea";

export default RadialArea;
