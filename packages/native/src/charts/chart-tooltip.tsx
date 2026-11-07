import {
  Circle,
  DashPathEffect,
  Group,
  Line,
  LinearGradient,
  Rect,
  RoundedRect,
  rect,
  rrect,
  Shadow,
  type SkFont,
  Text,
  vec,
} from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import {
  type SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  type ChartSeries,
  getDate,
  getValue,
  sampleY,
  useChart,
} from "./chart-context";
import { DateTicker } from "./date-ticker";
import { type ChartMarker, markerIndex } from "./markers";
import {
  DOT_HALO_OPACITY,
  DOT_HALO_SCALE,
  DOT_SIZE,
  PANEL_ENTRANCE_SCALE,
  PANEL_ENTRANCE_X,
} from "./motion";
import { withAlpha } from "./theme";

export type IndicatorFadeEdges = "both" | "top" | "bottom" | "none";

export interface ChartTooltipProps {
  formatLabel?: (date: Date) => string;
  formatValue?: (value: number) => string;
  showCrosshair?: boolean;
  showDots?: boolean;
  /** Rolling month/day pill on the x-axis. Default: true. */
  showDatePill?: boolean;
  /**
   * Pill label. Split on the first space into two rolling stacks
   * ("Jan 27" → "Jan" + "27"); one word ("Wednesday") rolls as one.
   */
  datePillFormat?: (date: Date) => string;
  /** Floating panel with the header and rows. Default: true. */
  showPanel?: boolean;
  /** Crosshair dash pattern, e.g. `[4, 4]`. Omit for the gradient line. */
  indicatorDasharray?: [number, number];
  /** Vertical crosshair fade (ignored when dashed). Default: "both". */
  indicatorFadeEdges?: IndicatorFadeEdges;
  /** Crosshair colour. Default: theme crosshair. */
  indicatorColor?: string;
  /** Colour the crosshair like this series' dot (e.g. profit / loss sign). */
  indicatorColorFrom?: string;
  /** Add marker rows (title + description) on marker days. Max 2, then "+N more". */
  markers?: ChartMarker[];
}

// Panel metrics (web TooltipContent: px-3.5, header py-2.5, rows gap-2).
const PAD_X = 12;
const HEADER_H = 32;
const BODY_PAD_Y = 10;
const ROW_H = 18;
const ROW_GAP = 6;
const ROW_DOT = 8;
const LABEL_GAP = 8;
const VALUE_GAP = 24;
const MIN_WIDTH = 150;
const RADIUS = 12;
const MARKER_SECTION_GAP = 8;
const MARKER_ROW_H = 36;
const MARKER_MORE_H = 16;
const MAX_MARKER_ROWS = 2;
/** Web PANEL_SIZE_SPRING: critically damped, hugs new content. */
const PANEL_SIZE_SPRING = { stiffness: 500, damping: 45, mass: 1 };
/** Indicator fade zone, % of its height (web default 10). */
const INDICATOR_FADE = 0.1;

const defaultLabel = (date: Date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
const defaultValue = (value: number) => value.toLocaleString("en-US");

/**
 * Crosshair, series dots, date ticker and floating panel, all drawn in Skia
 * and driven by springs on the UI thread, so scrubbing never re-renders React.
 */
export function ChartTooltip({
  formatLabel = defaultLabel,
  formatValue = defaultValue,
  showCrosshair = true,
  showDots = true,
  showDatePill = true,
  datePillFormat,
  showPanel = true,
  indicatorDasharray,
  indicatorFadeEdges = "both",
  indicatorColor,
  indicatorColorFrom,
  markers,
}: ChartTooltipProps) {
  const {
    data,
    xDataKey,
    height,
    margin,
    xs,
    yScale,
    series,
    theme,
    fonts,
    activeIndex,
    crosshairX,
    tooltipOpacity,
    boxX,
    boxWidth,
    panelOpacity,
    panelEntrance,
    panelFlipped,
    dotEntrance,
  } = useChart();

  const titles = useMemo(
    () => data.map((d) => formatLabel(getDate(d, xDataKey))),
    [data, xDataKey, formatLabel]
  );

  const rows = useMemo(
    () =>
      series.map((s) => {
        const raw = data.map((d) => getValue(d, s.dataKey));
        const values = raw.map((v) => (v === null ? "—" : formatValue(v)));
        const sign = s.signColors;
        return {
          series: s,
          values,
          valueWidths: values.map((v) => fonts.tooltipStrong.getTextWidth(v)),
          labelWidth: fonts.tooltip.getTextWidth(s.label),
          ys: raw.map((v) => (v === null ? Number.NaN : yScale(v))),
          colors: raw.map((v) => {
            if (!sign) {
              return s.stroke;
            }
            return (v ?? 0) >= 0 ? sign.positive : sign.negative;
          }),
        };
      }),
    [series, data, formatValue, fonts, yScale]
  );

  // Per data index: up to two markers, plus "+N more".
  const markerRows = useMemo(() => {
    const slots = Array.from({ length: MAX_MARKER_ROWS }, () => ({
      titles: [] as string[],
      descriptions: [] as string[],
      colors: [] as string[],
    }));
    const more: string[] = [];
    const extra: number[] = [];
    let widest = 0;
    data.forEach((d, i) => {
      const hits = (markers ?? []).filter(
        (m) => markerIndex([d], xDataKey, m.date) === 0
      );
      slots.forEach((slot, k) => {
        const m = hits[k];
        slot.titles[i] = m?.title ?? "";
        slot.descriptions[i] = m?.description ?? "";
        slot.colors[i] = m?.color ?? theme.foregroundMuted;
        if (m) {
          widest = Math.max(
            widest,
            fonts.tooltipStrong.getTextWidth(m.title),
            fonts.tooltip.getTextWidth(m.description ?? "")
          );
        }
      });
      const overflow = hits.length - MAX_MARKER_ROWS;
      more[i] = overflow > 0 ? `+${overflow} more…` : "";
      const shown = Math.min(MAX_MARKER_ROWS, hits.length);
      extra[i] =
        shown > 0
          ? MARKER_SECTION_GAP +
            shown * MARKER_ROW_H +
            (overflow > 0 ? MARKER_MORE_H : 0)
          : 0;
    });
    return { slots, more, extra, widest };
  }, [data, xDataKey, markers, fonts, theme.foregroundMuted]);

  const panelWidth = useMemo(() => {
    const titleW = Math.max(
      0,
      ...titles.map((t) => fonts.tooltipStrong.getTextWidth(t))
    );
    const rowW = Math.max(
      0,
      ...rows.map(
        (r) =>
          ROW_DOT +
          LABEL_GAP +
          r.labelWidth +
          VALUE_GAP +
          Math.max(0, ...r.valueWidths)
      )
    );
    const markerW = markerRows.widest
      ? markerRows.widest + ROW_DOT + LABEL_GAP
      : 0;
    return Math.ceil(
      Math.max(
        MIN_WIDTH,
        titleW + PAD_X * 2,
        rowW + PAD_X * 2,
        markerW + PAD_X * 2
      )
    );
  }, [titles, rows, fonts, markerRows.widest]);

  useEffect(() => {
    boxWidth.value = showPanel ? panelWidth : 0;
  }, [boxWidth, panelWidth, showPanel]);

  const bodyBottom =
    HEADER_H + BODY_PAD_Y + rows.length * ROW_H + (rows.length - 1) * ROW_GAP;
  const baseHeight = bodyBottom + BODY_PAD_Y;
  // Grows for marker rows on marker days (web panel size spring).
  const panelHeight = useSharedValue(baseHeight);
  const extra = markerRows.extra;
  useAnimatedReaction(
    () => activeIndex.value,
    (i) => {
      const target = baseHeight + (extra[i] ?? 0);
      panelHeight.value =
        panelOpacity.value === 0
          ? target
          : withSpring(target, PANEL_SIZE_SPRING);
    }
  );
  const borderHeight = useDerivedValue(() => panelHeight.value - 1);
  const panelClip = useDerivedValue(() =>
    rrect(rect(0, 0, panelWidth, panelHeight.value), RADIUS, RADIUS)
  );
  const crosshairColors = useMemo(
    () => rows.find((r) => r.series.dataKey === indicatorColorFrom)?.colors,
    [rows, indicatorColorFrom]
  );
  const top = margin.top;
  const bottom = height - margin.bottom;

  const title = useDerivedValue(() => titles[activeIndex.value] ?? "");
  // Web entrance: scale 0.85 → 1 and x ∓20 → 0 from the crosshair-side top
  // corner, on PANEL_ENTRANCE_SPRING. Origin flips with the panel.
  const panelTransform = useDerivedValue(() => {
    const e = panelEntrance.value;
    const flipped = panelFlipped.value === 1;
    const originX = flipped ? panelWidth : 0;
    const slide = (flipped ? PANEL_ENTRANCE_X : -PANEL_ENTRANCE_X) * (1 - e);
    const scale = PANEL_ENTRANCE_SCALE + (1 - PANEL_ENTRANCE_SCALE) * e;
    return [
      { translateX: boxX.value + slide + originX },
      { translateY: top },
      { scale },
      { translateX: -originX },
    ];
  });

  return (
    <>
      {showCrosshair ? (
        <Crosshair
          activeIndex={activeIndex}
          bottom={bottom}
          color={indicatorColor ?? theme.crosshair}
          colors={crosshairColors}
          crosshairX={crosshairX}
          dash={indicatorDasharray}
          fade={indicatorFadeEdges}
          opacity={tooltipOpacity}
          top={top}
        />
      ) : null}
      {showDots
        ? rows.map((r) => (
            <TooltipDot
              activeIndex={activeIndex}
              colors={r.colors}
              crosshairX={crosshairX}
              entrance={dotEntrance}
              key={r.series.dataKey}
              opacity={tooltipOpacity}
              xs={xs}
              ys={r.ys}
            />
          ))
        : null}
      {showDatePill ? <DateTicker formatLabel={datePillFormat} /> : null}
      {showPanel ? (
        <Group opacity={panelOpacity} transform={panelTransform}>
          <Group>
            <RoundedRect
              color={theme.tooltipBackground}
              height={panelHeight}
              r={RADIUS}
              width={panelWidth}
              x={0}
              y={0}
            >
              <Shadow blur={12} color="rgba(0,0,0,0.10)" dx={0} dy={4} />
            </RoundedRect>
            <RoundedRect
              color={theme.tooltipBorder}
              height={borderHeight}
              r={RADIUS - 0.5}
              strokeWidth={1}
              style="stroke"
              width={panelWidth - 1}
              x={0.5}
              y={0.5}
            />
            <Text
              color={theme.tooltipForeground}
              font={fonts.tooltipStrong}
              text={title}
              x={PAD_X}
              y={HEADER_H / 2 + 4.5}
            />
            <Rect
              color={theme.tooltipBorder}
              height={1}
              width={panelWidth}
              x={0}
              y={HEADER_H}
            />
            {rows.map((r, i) => (
              <TooltipRow
                activeIndex={activeIndex}
                colors={r.colors}
                key={r.series.dataKey}
                labelColor={theme.tooltipMuted}
                labelFont={fonts.tooltip}
                panelWidth={panelWidth}
                series={r.series}
                valueColor={theme.tooltipForeground}
                valueFont={fonts.tooltipStrong}
                values={r.values}
                valueWidths={r.valueWidths}
                y={HEADER_H + BODY_PAD_Y + i * (ROW_H + ROW_GAP)}
              />
            ))}
            {markers?.length ? (
              <Group clip={panelClip}>
                <MarkerSection
                  activeIndex={activeIndex}
                  divider={theme.tooltipBorder}
                  fonts={fonts}
                  more={markerRows.more}
                  muted={theme.tooltipMuted}
                  panelWidth={panelWidth}
                  slots={markerRows.slots}
                  strong={theme.tooltipForeground}
                  top={bodyBottom + BODY_PAD_Y}
                />
              </Group>
            ) : null}
          </Group>
        </Group>
      ) : null}
    </>
  );
}

function MarkerSection({
  slots,
  more,
  activeIndex,
  top,
  panelWidth,
  fonts,
  divider,
  strong,
  muted,
}: {
  slots: { titles: string[]; descriptions: string[]; colors: string[] }[];
  more: string[];
  activeIndex: SharedValue<number>;
  top: number;
  panelWidth: number;
  fonts: ReturnType<typeof useChart>["fonts"];
  divider: string;
  strong: string;
  muted: string;
}) {
  const visible = useDerivedValue(() =>
    slots[0]?.titles[activeIndex.value] ? 1 : 0
  );
  const moreText = useDerivedValue(() => more[activeIndex.value] ?? "");
  const moreY = useDerivedValue(() => {
    const shown = slots.filter((s) => s.titles[activeIndex.value]).length;
    return top + MARKER_SECTION_GAP + shown * MARKER_ROW_H + 11;
  });
  return (
    <Group opacity={visible}>
      <Rect
        color={divider}
        height={1}
        width={panelWidth - PAD_X * 2}
        x={PAD_X}
        y={top}
      />
      {slots.map((slot, k) => (
        <MarkerRow
          activeIndex={activeIndex}
          fonts={fonts}
          key={k}
          muted={muted}
          slot={slot}
          strong={strong}
          y={top + MARKER_SECTION_GAP + k * MARKER_ROW_H}
        />
      ))}
      <Text
        color={muted}
        font={fonts.tooltip}
        text={moreText}
        x={PAD_X}
        y={moreY}
      />
    </Group>
  );
}

function MarkerRow({
  slot,
  activeIndex,
  y,
  fonts,
  strong,
  muted,
}: {
  slot: { titles: string[]; descriptions: string[]; colors: string[] };
  activeIndex: SharedValue<number>;
  y: number;
  fonts: ReturnType<typeof useChart>["fonts"];
  strong: string;
  muted: string;
}) {
  const title = useDerivedValue(() => slot.titles[activeIndex.value] ?? "");
  const description = useDerivedValue(
    () => slot.descriptions[activeIndex.value] ?? ""
  );
  const color = useDerivedValue(() => slot.colors[activeIndex.value] ?? muted);
  const visible = useDerivedValue(() => (title.value ? 1 : 0));
  return (
    <Group opacity={visible}>
      <Circle
        color={color}
        cx={PAD_X + ROW_DOT / 2}
        cy={y + 9}
        r={ROW_DOT / 2}
      />
      <Text
        color={strong}
        font={fonts.tooltipStrong}
        text={title}
        x={PAD_X + ROW_DOT + LABEL_GAP}
        y={y + 13}
      />
      <Text
        color={muted}
        font={fonts.tooltip}
        text={description}
        x={PAD_X + ROW_DOT + LABEL_GAP}
        y={y + 30}
      />
    </Group>
  );
}

function fadeStops(fade: IndicatorFadeEdges, color: string) {
  const clear = withAlpha(color, 0);
  const f = INDICATOR_FADE;
  switch (fade) {
    case "top":
      return { colors: [clear, color, color], positions: [0, f, 1] };
    case "bottom":
      return { colors: [color, color, clear], positions: [0, 1 - f, 1] };
    case "none":
      return { colors: [color, color], positions: [0, 1] };
    default:
      return {
        colors: [clear, color, color, clear],
        positions: [0, f, 1 - f, 1],
      };
  }
}

function Crosshair({
  activeIndex,
  colors,
  crosshairX,
  opacity,
  top,
  bottom,
  color,
  dash,
  fade,
}: {
  crosshairX: SharedValue<number>;
  opacity: SharedValue<number>;
  top: number;
  bottom: number;
  color: string;
  dash?: [number, number];
  fade: IndicatorFadeEdges;
  activeIndex: SharedValue<number>;
  colors?: string[];
}) {
  const live = useDerivedValue(
    () => (colors ? colors[activeIndex.value] : undefined) ?? color
  );
  const p1 = useDerivedValue(() => ({ x: crosshairX.value, y: top }));
  const p2 = useDerivedValue(() => ({ x: crosshairX.value, y: bottom }));
  const barX = useDerivedValue(() => crosshairX.value - 0.5);

  // Per-point colour (e.g. profit / loss) draws a plain line.
  if (dash || colors) {
    return (
      <Line color={live} opacity={opacity} p1={p1} p2={p2} strokeWidth={1}>
        {dash ? <DashPathEffect intervals={dash} /> : null}
      </Line>
    );
  }

  const stops = fadeStops(fade, color);
  return (
    <Rect height={bottom - top} opacity={opacity} width={1} x={barX} y={top}>
      <LinearGradient
        colors={stops.colors}
        end={vec(0, bottom)}
        positions={stops.positions}
        start={vec(0, top)}
      />
    </Rect>
  );
}

function TooltipDot({
  xs,
  ys,
  colors,
  activeIndex,
  crosshairX,
  opacity,
  entrance,
}: {
  xs: number[];
  ys: number[];
  colors: string[];
  activeIndex: SharedValue<number>;
  crosshairX: SharedValue<number>;
  opacity: SharedValue<number>;
  entrance: SharedValue<number>;
}) {
  const halos = useMemo(
    () => colors.map((c) => withAlpha(c, DOT_HALO_OPACITY)),
    [colors]
  );
  // Rides the crosshair spring, following the line between points; hidden
  // where the series has no value.
  const cy = useDerivedValue(() => sampleY(xs, ys, crosshairX.value));
  const visible = useDerivedValue(() =>
    Number.isFinite(cy.value) ? opacity.value : 0
  );
  const safeCy = useDerivedValue(() =>
    Number.isFinite(cy.value) ? cy.value : -100
  );
  const color = useDerivedValue(() => colors[activeIndex.value] ?? "#000");
  const halo = useDerivedValue(() => halos[activeIndex.value] ?? "#0000");
  // Web tooltip-dot: dot 2.5 → 5, halo 5 → 13, both on HALO_SPRING.
  const r = useDerivedValue(() => DOT_SIZE * (0.5 + 0.5 * entrance.value));
  const haloR = useDerivedValue(
    () => DOT_SIZE + DOT_SIZE * (DOT_HALO_SCALE - 1) * entrance.value
  );
  return (
    <Group opacity={visible}>
      <Circle color={halo} cx={crosshairX} cy={safeCy} r={haloR} />
      <Circle color={color} cx={crosshairX} cy={safeCy} r={r} />
    </Group>
  );
}

function TooltipRow({
  series,
  colors,
  values,
  valueWidths,
  activeIndex,
  panelWidth,
  y,
  labelFont,
  valueFont,
  labelColor,
  valueColor,
}: {
  series: ChartSeries;
  colors: string[];
  values: string[];
  valueWidths: number[];
  activeIndex: SharedValue<number>;
  panelWidth: number;
  y: number;
  labelFont: SkFont;
  valueFont: SkFont;
  labelColor: string;
  valueColor: string;
}) {
  const value = useDerivedValue(() => values[activeIndex.value] ?? "");
  const valueX = useDerivedValue(
    () => panelWidth - PAD_X - (valueWidths[activeIndex.value] ?? 0)
  );
  const dotColor = useDerivedValue(
    () => colors[activeIndex.value] ?? series.stroke
  );
  const baseline = y + ROW_H / 2 + 4.5;
  return (
    <>
      <Circle
        color={dotColor}
        cx={PAD_X + ROW_DOT / 2}
        cy={y + ROW_H / 2}
        r={ROW_DOT / 2}
      />
      <Text
        color={labelColor}
        font={labelFont}
        text={series.label}
        x={PAD_X + ROW_DOT + LABEL_GAP}
        y={baseline}
      />
      <Text
        color={valueColor}
        font={valueFont}
        text={value}
        x={valueX}
        y={baseline}
      />
    </>
  );
}
