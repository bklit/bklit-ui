"use client";

import { scaleUtc } from "d3-scale";
import { motion, type Transition } from "motion/react";
import { type ReactNode, useId, useMemo } from "react";
import {
  DEFAULT_CHART_ENTER_TRANSITION,
  GRID_ANGLE_LABEL_FADE_S,
  GRID_ANGLE_LABEL_STAGGER_S,
  GRID_RING_SPRING,
  GRID_RING_STAGGER_S,
  GRID_SPOKE_SPRING,
  GRID_SPOKE_STAGGER_S,
  GRID_VALUE_LABEL_STAGGER_S,
  gridLabelDelay,
} from "./animation";
import { arcStartLabelLayout } from "./arc-geometry";
import { useRadialChart } from "./radial-chart";
import {
  polarToCartesian,
  radialArcPath,
  radialValueTicks,
  TAU,
} from "./radial-geometry";

/**
 * How angle labels sit on the circle.
 * - `horizontal`: upright text centred on its angle (clock / month labels)
 * - `radial`: text runs outward along the radius, flipped on the left half
 *   so it never reads upside down (dense category labels)
 * - `tangential`: text follows the circle, flipped on the bottom half
 */
export type RadialLabelOrientation = "horizontal" | "radial" | "tangential";

export interface RadialAxisProps {
  /** Center circle with a thin stroke. Default: true */
  showCircle?: boolean;
  /** Faint radial-gradient fill inside the center circle. Default: false */
  centerGradient?: boolean;
  /** Tick marks just outside the center circle. Default: 24 for clock charts, else 0 */
  tickCount?: number;
  /** Every n-th tick is long. Default: 6 (00 / 06 / 12 / 18) */
  majorTickEvery?: number;
  /**
   * Labels spaced evenly along the arc from the start angle, or false to hide.
   * Default: 00 / 06 / 12 / 18 (clock), every category (band), time ticks
   * (time), value ticks (angular)
   */
  labels?: string[] | false;
  /** Label color. Default: var(--muted-foreground) */
  labelColor?: string;
  /** Circle / tick / grid color. Default: var(--foreground) */
  stroke?: string;
  /** Label orientation. Default: "radial" for band charts, else "horizontal" */
  labelOrientation?: RadialLabelOrientation;
  /**
   * Label radius as a fraction of the chart radius. Default:
   * `layout.axisLabel` (rotated band labels start just outside the band)
   */
  labelRadius?: number;
  /** Band charts: label every n-th category. Default: 1 */
  labelEvery?: number;
  /** Band charts: format `datum[xDataKey]`. Default: String(value) */
  labelFormat?: (value: unknown, index: number) => string;
  /** Time charts: tick count hint or explicit tick times. Default: 12 */
  timeTicks?: number | (Date | number)[];
  /** Time charts: tick label format. Default: short month (UTC) for spans over 60 days */
  timeTickFormat?: (date: Date) => string;
  /**
   * Time charts: label at the tick, or centred between ticks (month names in
   * the middle of their month). Default: "between"
   */
  timeLabelPosition?: "tick" | "between";
  /**
   * Spokes across the value band at every angle tick (time ticks, or value
   * ticks for angular charts). Default: true for time and angular charts
   */
  angleGrid?: boolean;
  /**
   * Value grid: tick count hint or explicit values. Radial charts draw a
   * ring (an arc on partial charts) per value; angular charts use them as
   * the angle ticks. Default: none for radial charts, 5 for angular charts
   */
  valueTicks?: number | number[];
  /** Value tick label format. Default: en-US number */
  valueTickFormat?: (value: number) => string;
  /** Show value tick labels. Default: true */
  showValueLabels?: boolean;
  /** Radial charts: angle (degrees) the value labels sit at. Default: the start angle */
  valueLabelAngle?: number;
  /** Angular charts: category labels at the start of each ring. Default: true */
  showRingLabels?: boolean;
  /** Grid ring / spoke opacity. Default: 0.12 */
  gridOpacity?: number;
}

const DEFAULT_LABELS = ["00", "06", "12", "18"];
const DAY_MS = 86_400_000;

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});
const numberFormat = new Intl.NumberFormat("en-US");

/** Font size for radial labels — scales with the chart, 10–18px. */
export function radialLabelFontSize(radius: number): number {
  return Math.min(18, Math.max(10, radius * 0.045));
}

/*
 * Grid enter — the radar chart standard (see `RadarGrid`): rings scale and
 * fade in from the center one after another, spokes extend outward, then
 * labels fade in. Waits for the chart's `revealed` flag; skipped entirely
 * when `animate` is false (prop or prefers-reduced-motion).
 */

interface GridEnter {
  animate: boolean;
  revealed: boolean;
}

/** Cap on the total angle-label stagger so dense band labels don't trail. */
const ANGLE_LABEL_MAX_STAGGER_S = 0.6;

const RING_HIDDEN = { scale: 0, opacity: 0 };
const RING_SHOWN = { scale: 1, opacity: 1 };
const ORIGIN_STYLE = { transformOrigin: "0px 0px" };

/** One grid ring (or ring-like layer) growing out of the chart center. */
function GridRingEnter({
  enter,
  index,
  children,
}: {
  enter: GridEnter;
  index: number;
  children: ReactNode;
}) {
  if (!enter.animate) {
    return <g>{children}</g>;
  }
  return (
    <motion.g
      animate={enter.revealed ? RING_SHOWN : RING_HIDDEN}
      initial={RING_HIDDEN}
      style={ORIGIN_STYLE}
      transition={{
        ...GRID_RING_SPRING,
        delay: index * GRID_RING_STAGGER_S,
      }}
    >
      {children}
    </motion.g>
  );
}

/** Value / ring labels: a plain fade (RadarGrid level labels). */
function GridLabelFade({
  enter,
  delay,
  children,
}: {
  enter: GridEnter;
  delay: number;
  children: ReactNode;
}) {
  if (!enter.animate) {
    return <>{children}</>;
  }
  const transition: Transition = { ...DEFAULT_CHART_ENTER_TRANSITION, delay };
  return (
    <motion.g
      animate={{ opacity: enter.revealed ? 1 : 0 }}
      initial={{ opacity: 0 }}
      transition={transition}
    >
      {children}
    </motion.g>
  );
}

interface AngleLabel {
  key: string;
  angle: number;
  text: string;
}

function normalizeAngle(angle: number): number {
  return ((angle % TAU) + TAU) % TAU;
}

/** SVG transform + anchor for a label at `angle`. */
function labelPlacement(
  orientation: RadialLabelOrientation,
  angle: number,
  r: number
): { transform: string; anchor: "start" | "middle" | "end" } {
  const p = polarToCartesian(angle, r);
  const a = normalizeAngle(angle);
  const deg = (a * 180) / Math.PI;
  if (orientation === "radial") {
    const flip = a > Math.PI;
    return {
      transform: `translate(${p.x},${p.y}) rotate(${deg - 90 + (flip ? 180 : 0)})`,
      anchor: flip ? "end" : "start",
    };
  }
  if (orientation === "tangential") {
    const flip = a > Math.PI / 2 && a < (3 * Math.PI) / 2;
    return {
      transform: `translate(${p.x},${p.y}) rotate(${deg + (flip ? 180 : 0)})`,
      anchor: "middle",
    };
  }
  return { transform: `translate(${p.x},${p.y})`, anchor: "middle" };
}

interface TextProps {
  className: string;
  dominantBaseline: "central";
  fill: string;
  fontSize: number;
  stroke: string;
  style: { fill: string };
}

interface TimeTick {
  time: number;
  angle: number;
  labelAngle: number | null;
  text: string;
}

function formatNumber(value: number): string {
  return numberFormat.format(value);
}

function bandLabel(
  raw: unknown,
  index: number,
  labelFormat: RadialAxisProps["labelFormat"]
): string {
  return labelFormat ? labelFormat(raw, index) : String(raw ?? "");
}

/** Labels spread evenly from the start angle (ending on the end angle for partial arcs). */
function evenLabels(
  texts: string[],
  isFullCircle: boolean,
  fractionToAngle: (fraction: number) => number
): AngleLabel[] {
  const steps = isFullCircle ? texts.length : Math.max(1, texts.length - 1);
  return texts.map((text, i) => ({
    key: `label-${i}-${text}`,
    angle: fractionToAngle(i / steps),
    text,
  }));
}

function computeTimeTicks({
  timeDomain,
  timeTicks,
  timeTickFormat,
  timeLabelPosition,
  timeToAngle,
}: {
  timeDomain: [number, number];
  timeTicks: number | (Date | number)[];
  timeTickFormat?: (date: Date) => string;
  timeLabelPosition: "tick" | "between";
  timeToAngle: (time: number) => number | null;
}): TimeTick[] {
  const [t0, t1] = timeDomain;
  const scale = scaleUtc().domain([t0, t1]);
  const times =
    typeof timeTicks === "number"
      ? scale.ticks(timeTicks).map((d) => d.getTime())
      : timeTicks.map((t) => (typeof t === "number" ? t : t.getTime()));
  const longSpan = t1 - t0 > 60 * DAY_MS;
  const format =
    timeTickFormat ??
    (longSpan ? (d: Date) => monthFormat.format(d) : scale.tickFormat());
  const result: TimeTick[] = [];
  times.forEach((time, i) => {
    const angle = timeToAngle(time);
    if (angle === null) {
      return;
    }
    let labelAngle: number | null = angle;
    if (timeLabelPosition === "between") {
      const nextAngle = timeToAngle(Math.min(times[i + 1] ?? t1, t1));
      labelAngle =
        nextAngle === null || nextAngle === angle
          ? null
          : (angle + nextAngle) / 2;
    }
    result.push({ time, angle, labelAngle, text: format(new Date(time)) });
  });
  return result;
}

function AxisCenterCircle({
  r,
  stroke,
  gradient,
}: {
  r: number;
  stroke: string;
  gradient: boolean;
}) {
  const gradientId = `radial-axis-center-${useId().replace(/:/g, "")}`;
  return (
    <>
      {gradient ? (
        <defs>
          <radialGradient id={gradientId}>
            <stop offset="0%" stopColor={stroke} stopOpacity={0.06} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </radialGradient>
        </defs>
      ) : null}
      <circle
        fill={gradient ? `url(#${gradientId})` : "none"}
        r={r}
        stroke={stroke}
        strokeOpacity={0.1}
        strokeWidth={1}
      />
    </>
  );
}

function AxisTickRing({
  tickCount,
  majorTickEvery,
  stroke,
}: {
  tickCount: number;
  majorTickEvery: number;
  stroke: string;
}) {
  const { radius, layout, startAngle, endAngle, isFullCircle } =
    useRadialChart();
  const span = endAngle - startAngle;
  return (
    <g stroke={stroke} strokeLinecap="round">
      {Array.from(
        { length: isFullCircle ? tickCount : tickCount + 1 },
        (_, i) => {
          const angle = startAngle + (i / tickCount) * span;
          const major = majorTickEvery > 0 && i % majorTickEvery === 0;
          const a = polarToCartesian(angle, radius * layout.tickInner);
          const b = polarToCartesian(
            angle,
            radius * (major ? layout.tickMajorOuter : layout.tickMinorOuter)
          );
          return (
            <line
              key={`tick-${angle}`}
              strokeOpacity={major ? 0.4 : 0.22}
              strokeWidth={major ? 1.25 : 1}
              x1={a.x}
              x2={b.x}
              y1={a.y}
              y2={b.y}
            />
          );
        }
      )}
    </g>
  );
}

function AxisSpokes({
  angles,
  stroke,
  opacity,
  enter,
}: {
  angles: number[];
  stroke: string;
  opacity: number;
  enter: GridEnter;
}) {
  const { innerRadius, outerRadius } = useRadialChart();
  return (
    <g stroke={stroke} strokeOpacity={opacity}>
      {angles.map((angle, i) => {
        const a = polarToCartesian(angle, innerRadius);
        const b = polarToCartesian(angle, outerRadius);
        if (!enter.animate) {
          return (
            <line key={`spoke-${angle}`} x1={a.x} x2={b.x} y1={a.y} y2={b.y} />
          );
        }
        // RadarAxis: each spoke extends from its inner end outward.
        const end = enter.revealed ? b : a;
        return (
          <motion.line
            animate={{ x2: end.x, y2: end.y }}
            initial={{ x2: a.x, y2: a.y }}
            key={`spoke-${angle}`}
            transition={{
              ...GRID_SPOKE_SPRING,
              delay: i * GRID_SPOKE_STAGGER_S,
            }}
            x1={a.x}
            y1={a.y}
          />
        );
      })}
    </g>
  );
}

function AxisValueRings({
  ticks,
  format,
  showLabels,
  labelAngle,
  stroke,
  opacity,
  textProps,
  enter,
  firstRing,
  labelDelay,
}: {
  ticks: number[];
  format: (value: number) => string;
  showLabels: boolean;
  labelAngle: number;
  stroke: string;
  opacity: number;
  textProps: TextProps;
  enter: GridEnter;
  /** Enter index of the innermost value ring */
  firstRing: number;
  labelDelay: number;
}) {
  const { valueScale, startAngle, endAngle } = useRadialChart();
  // Innermost ring first, whatever order the ticks came in.
  const order = [...ticks].sort(
    (a, b) => Math.abs(valueScale(a)) - Math.abs(valueScale(b))
  );
  return (
    <g>
      <g fill="none" stroke={stroke} strokeOpacity={opacity}>
        {ticks.map((v) => (
          <GridRingEnter
            enter={enter}
            index={firstRing + order.indexOf(v)}
            key={`ring-${v}`}
          >
            <path d={radialArcPath(valueScale(v), startAngle, endAngle)} />
          </GridRingEnter>
        ))}
      </g>
      {showLabels
        ? ticks.map((v) => {
            const p = polarToCartesian(labelAngle, valueScale(v));
            return (
              <GridLabelFade
                delay={
                  labelDelay + order.indexOf(v) * GRID_VALUE_LABEL_STAGGER_S
                }
                enter={enter}
                key={`ring-label-${v}`}
              >
                <text
                  {...textProps}
                  fontSize={textProps.fontSize * 0.85}
                  paintOrder="stroke"
                  stroke="var(--background)"
                  strokeLinejoin="round"
                  strokeWidth={4}
                  textAnchor="middle"
                  x={p.x}
                  y={p.y}
                >
                  {format(v)}
                </text>
              </GridLabelFade>
            );
          })
        : null}
    </g>
  );
}

/** Angular charts: category label just before each ring's start. */
function AxisRingLabels({
  labelFormat,
  textProps,
  enter,
  labelDelay,
}: {
  labelFormat: RadialAxisProps["labelFormat"];
  textProps: TextProps;
  enter: GridEnter;
  labelDelay: number;
}) {
  const { data, xDataKey, startAngle, endAngle, ringBand } = useRadialChart();
  // Steps back along the start tangent; rotated upright for 3 / 9 o'clock starts.
  const layout = arcStartLabelLayout(
    startAngle,
    endAngle,
    textProps.fontSize * 0.6
  );
  return (
    <>
      {data.map((d, i) => {
        const { x, y, transform } = layout.position(ringBand(i).center);
        return (
          <GridLabelFade
            delay={labelDelay + i * GRID_VALUE_LABEL_STAGGER_S}
            enter={enter}
            key={`ring-label-${i}`}
          >
            <text
              {...textProps}
              fontSize={textProps.fontSize * 0.8}
              textAnchor={layout.anchor}
              transform={transform}
              x={x}
              y={y}
            >
              {bandLabel(d[xDataKey], i, labelFormat)}
            </text>
          </GridLabelFade>
        );
      })}
    </>
  );
}

/** Enter index of each ring-like layer, and when the labels start. */
function gridEnterOrder({
  showCircle,
  tickRing,
  valueRings,
  outerArc,
}: {
  showCircle: boolean;
  tickRing: boolean;
  valueRings: number;
  outerArc: boolean;
}) {
  const tickRingIndex = Number(showCircle);
  const firstValueRing = tickRingIndex + Number(tickRing);
  const outerArcIndex = firstValueRing + valueRings;
  return {
    tickRingIndex,
    firstValueRing,
    outerArcIndex,
    labelDelay: gridLabelDelay(outerArcIndex + Number(outerArc)),
  };
}

/** Angle labels — fade in while sliding out from the center (RadarLabels). */
function AxisAngleLabels({
  labels,
  orientation,
  labelRadius,
  fontSize,
  rotated,
  textProps,
  enter,
  labelDelay,
}: {
  labels: AngleLabel[];
  rotated: boolean;
  orientation: RadialLabelOrientation;
  labelRadius: number;
  fontSize: number;
  textProps: TextProps;
  enter: GridEnter;
  labelDelay: number;
}) {
  const stagger = Math.min(
    GRID_ANGLE_LABEL_STAGGER_S,
    ANGLE_LABEL_MAX_STAGGER_S / Math.max(1, labels.length)
  );
  return (
    <>
      {labels.map((label, i) => {
        const { transform, anchor } = labelPlacement(
          orientation,
          label.angle,
          labelRadius
        );
        const text = (
          <text
            {...textProps}
            fontSize={rotated ? fontSize * 0.8 : fontSize}
            textAnchor={anchor}
            transform={transform}
          >
            {label.text}
          </text>
        );
        if (!enter.animate) {
          return <g key={label.key}>{text}</g>;
        }
        const from = polarToCartesian(label.angle, -labelRadius);
        const shown = { opacity: 1, x: 0, y: 0 };
        const hidden = { opacity: 0, x: from.x, y: from.y };
        return (
          <motion.g
            animate={enter.revealed ? shown : hidden}
            initial={hidden}
            key={label.key}
            transition={{
              opacity: {
                duration: GRID_ANGLE_LABEL_FADE_S,
                delay: labelDelay + i * stagger,
              },
              x: GRID_SPOKE_SPRING,
              y: GRID_SPOKE_SPRING,
            }}
          >
            {text}
          </motion.g>
        );
      })}
    </>
  );
}

function useAngleLabels({
  labels,
  valueTicks,
  valueTickFormat,
  labelEvery,
  labelFormat,
  timeTicks,
}: {
  labels: string[] | false | undefined;
  valueTicks: number[];
  valueTickFormat: (value: number) => string;
  labelEvery: number;
  labelFormat: RadialAxisProps["labelFormat"];
  timeTicks: TimeTick[];
}): AngleLabel[] {
  const {
    data,
    xDataKey,
    binCount,
    angleType,
    orientation,
    isFullCircle,
    binAngle,
    fractionToAngle,
    valueToAngle,
  } = useRadialChart();
  return useMemo((): AngleLabel[] => {
    if (labels === false) {
      return [];
    }
    if (labels) {
      return evenLabels(labels, isFullCircle, fractionToAngle);
    }
    if (orientation === "angular") {
      return valueTicks.map((v) => ({
        key: `value-${v}`,
        angle: valueToAngle(v),
        text: valueTickFormat(v),
      }));
    }
    if (angleType === "band") {
      const every = Math.max(1, Math.round(labelEvery));
      const result: AngleLabel[] = [];
      for (let i = 0; i < binCount; i += every) {
        result.push({
          key: `band-${i}`,
          angle: binAngle(i),
          text: bandLabel(data[i]?.[xDataKey], i, labelFormat),
        });
      }
      return result;
    }
    if (angleType === "time") {
      return timeTicks.flatMap((t) =>
        t.labelAngle === null
          ? []
          : [{ key: `time-${t.time}`, angle: t.labelAngle, text: t.text }]
      );
    }
    return evenLabels(DEFAULT_LABELS, isFullCircle, fractionToAngle);
  }, [
    labels,
    isFullCircle,
    fractionToAngle,
    orientation,
    valueTicks,
    valueToAngle,
    valueTickFormat,
    angleType,
    labelEvery,
    binCount,
    data,
    xDataKey,
    binAngle,
    labelFormat,
    timeTicks,
  ]);
}

function resolveValueTicks(
  spec: number | number[] | undefined,
  domain: [number, number]
): number[] {
  if (spec === undefined) {
    return [];
  }
  return typeof spec === "number" ? radialValueTicks(domain, spec) : spec;
}

/**
 * Axis chrome for {@link RadialChart}: the center circle, the tick ring,
 * angle labels (clock hours, rotated category labels or time ticks),
 * optional value grid rings with labels, and — for `angular` charts — value
 * ticks along the arc with category labels at each ring's start.
 */
export function RadialAxis({
  showCircle = true,
  centerGradient = false,
  tickCount: tickCountProp,
  majorTickEvery = 6,
  labels,
  labelColor = "var(--muted-foreground)",
  stroke = "var(--foreground)",
  labelOrientation: labelOrientationProp,
  labelRadius: labelRadiusProp,
  labelEvery = 1,
  labelFormat,
  timeTicks = 12,
  timeTickFormat,
  timeLabelPosition = "between",
  angleGrid: angleGridProp,
  valueTicks: valueTicksProp,
  valueTickFormat = formatNumber,
  showValueLabels = true,
  valueLabelAngle,
  showRingLabels = true,
  gridOpacity = 0.12,
}: RadialAxisProps) {
  const {
    radius,
    layout,
    centerRadius,
    outerRadius,
    angleType,
    orientation,
    startAngle,
    endAngle,
    timeDomain,
    timeToAngle,
    valueDomain,
    valueToAngle,
    animate,
    revealed,
  } = useRadialChart();
  const enter = useMemo<GridEnter>(
    () => ({ animate, revealed }),
    [animate, revealed]
  );
  const fontSize = radialLabelFontSize(radius);
  const angular = orientation === "angular";
  const isClock = angleType === "clock" && !angular;
  const isBand = angleType === "band" && !angular;

  const tickCount = tickCountProp ?? (isClock ? 24 : 0);
  const labelOrientation =
    labelOrientationProp ?? (isBand ? "radial" : "horizontal");
  const rotated = labelOrientation !== "horizontal";
  const defaultLabelRadius = rotated
    ? layout.bandOuter + 0.03
    : layout.axisLabel;
  const labelRadius = radius * (labelRadiusProp ?? defaultLabelRadius);
  const angleGrid = angleGridProp ?? (angleType === "time" || angular);

  const valueTicks = useMemo(
    () =>
      resolveValueTicks(
        valueTicksProp ?? (angular ? 5 : undefined),
        valueDomain
      ),
    [valueTicksProp, angular, valueDomain]
  );

  const timeTickList = useMemo(
    () =>
      !angular && angleType === "time" && timeDomain
        ? computeTimeTicks({
            timeDomain,
            timeTicks,
            timeTickFormat,
            timeLabelPosition,
            timeToAngle,
          })
        : [],
    [
      angular,
      angleType,
      timeDomain,
      timeTicks,
      timeTickFormat,
      timeLabelPosition,
      timeToAngle,
    ]
  );

  const angleLabels = useAngleLabels({
    labels,
    valueTicks,
    valueTickFormat,
    labelEvery,
    labelFormat,
    timeTicks: timeTickList,
  });

  const spokeAngles = useMemo(() => {
    if (!angleGrid) {
      return [];
    }
    return angular
      ? valueTicks.map(valueToAngle)
      : timeTickList.map((t) => t.angle);
  }, [angleGrid, angular, valueTicks, valueToAngle, timeTickList]);

  // Enter order: center circle, tick ring, value rings (inside out), outer arc.
  const valueRingCount = angular ? 0 : valueTicks.length;
  const { tickRingIndex, firstValueRing, outerArcIndex, labelDelay } =
    gridEnterOrder({
      showCircle,
      tickRing: tickCount > 0,
      valueRings: valueRingCount,
      outerArc: angular,
    });

  const textProps: TextProps = {
    className: "font-mono",
    dominantBaseline: "central",
    fill: labelColor,
    fontSize,
    stroke: "none",
    style: { fill: labelColor },
  };

  return (
    <g pointerEvents="none">
      {showCircle ? (
        <GridRingEnter enter={enter} index={0}>
          <AxisCenterCircle
            gradient={centerGradient}
            r={centerRadius}
            stroke={stroke}
          />
        </GridRingEnter>
      ) : null}

      {tickCount > 0 ? (
        <GridRingEnter enter={enter} index={tickRingIndex}>
          <AxisTickRing
            majorTickEvery={majorTickEvery}
            stroke={stroke}
            tickCount={tickCount}
          />
        </GridRingEnter>
      ) : null}

      {spokeAngles.length > 0 ? (
        <AxisSpokes
          angles={spokeAngles}
          enter={enter}
          opacity={gridOpacity}
          stroke={stroke}
        />
      ) : null}

      {valueRingCount > 0 ? (
        <AxisValueRings
          enter={enter}
          firstRing={firstValueRing}
          format={valueTickFormat}
          labelAngle={
            valueLabelAngle === undefined
              ? startAngle
              : (valueLabelAngle * Math.PI) / 180
          }
          labelDelay={labelDelay}
          opacity={gridOpacity}
          showLabels={showValueLabels}
          stroke={stroke}
          textProps={textProps}
          ticks={valueTicks}
        />
      ) : null}

      {angular ? (
        <GridRingEnter enter={enter} index={outerArcIndex}>
          <path
            d={radialArcPath(outerRadius, startAngle, endAngle)}
            fill="none"
            stroke={stroke}
            strokeOpacity={gridOpacity}
          />
        </GridRingEnter>
      ) : null}

      <AxisAngleLabels
        enter={enter}
        fontSize={fontSize}
        labelDelay={labelDelay}
        labelRadius={labelRadius}
        labels={angleLabels}
        orientation={labelOrientation}
        rotated={rotated}
        textProps={textProps}
      />

      {angular && showRingLabels ? (
        <AxisRingLabels
          enter={enter}
          labelDelay={labelDelay}
          labelFormat={labelFormat}
          textProps={textProps}
        />
      ) : null}
    </g>
  );
}

RadialAxis.displayName = "RadialAxis";

export default RadialAxis;
