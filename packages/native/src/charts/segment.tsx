import {
  DashPathEffect,
  Group,
  Line,
  LinearGradient,
  Rect,
  RoundedRect,
  Text,
  vec,
} from "@shopify/react-native-skia";
import { useMemo } from "react";
import { type SharedValue, useDerivedValue } from "react-native-reanimated";
import { getNumber, useChart } from "./chart-context";
import { withAlpha } from "./theme";

/**
 * Two-finger segment selection, the native take on the web's press-and-drag
 * `SegmentBackground` / `SegmentLineFrom` / `SegmentLineTo`. Selection stays
 * until the next touch.
 */

/** Hidden below this width, like web (5px). */
const MIN_SELECTION_PX = 5;

function useSelectionOpacity() {
  const { selectionOpacity, selectionStartX, selectionEndX } = useChart();
  return useDerivedValue(() =>
    Math.abs(selectionEndX.value - selectionStartX.value) > MIN_SELECTION_PX
      ? selectionOpacity.value
      : 0
  );
}

/** Sign of the change in `trendKey` across the selection (UI thread). */
function useTrendUp(trendKey: string | undefined): SharedValue<boolean> {
  const { data, selectionStartIndex, selectionEndIndex } = useChart();
  const values = useMemo(
    () => (trendKey ? data.map((d) => getNumber(d, trendKey)) : []),
    [data, trendKey]
  );
  return useDerivedValue(() => {
    const start = values[selectionStartIndex.value] ?? 0;
    const end = values[selectionEndIndex.value] ?? 0;
    return end >= start;
  });
}

export interface SegmentBackgroundProps {
  /** Fixed fill. Overrides the trend tint. */
  fill?: string;
  /** Tint green (up) / red (down) by the change in this key. */
  trendKey?: string;
  /** Trend tint strength. Default: 0.14 (matches homepage). */
  trendOpacity?: number;
}

export function SegmentBackground({
  fill,
  trendKey,
  trendOpacity = 0.14,
}: SegmentBackgroundProps) {
  const { height, margin, theme, selectionStartX, selectionEndX } = useChart();
  const opacity = useSelectionOpacity();
  const up = useTrendUp(trendKey);
  const upColor = withAlpha(theme.positive, trendOpacity);
  const downColor = withAlpha(theme.negative, trendOpacity);
  const color = useDerivedValue(() => {
    if (fill) {
      return fill;
    }
    if (!trendKey) {
      return theme.segmentBackground;
    }
    return up.value ? upColor : downColor;
  });
  const x = useDerivedValue(() => selectionStartX.value);
  const w = useDerivedValue(() => selectionEndX.value - selectionStartX.value);

  return (
    <Rect
      color={color}
      height={height - margin.top - margin.bottom}
      opacity={opacity}
      width={w}
      x={x}
      y={margin.top}
    />
  );
}

export type SegmentLineVariant = "dashed" | "solid" | "gradient";

export interface SegmentLineProps {
  /** Fixed stroke. Overrides the trend tint. */
  stroke?: string;
  /** Tint green (up) / red (down) by the change in this key. */
  trendKey?: string;
  strokeWidth?: number;
  /** Default: "dashed" (matches web). */
  variant?: SegmentLineVariant;
}

function SegmentLine({
  edge,
  stroke,
  trendKey,
  strokeWidth = 1,
  variant = "dashed",
}: SegmentLineProps & { edge: "from" | "to" }) {
  const { height, margin, theme, selectionStartX, selectionEndX } = useChart();
  const opacity = useSelectionOpacity();
  const up = useTrendUp(trendKey);
  const top = margin.top;
  const bottom = height - margin.bottom;
  const x = useDerivedValue(() =>
    edge === "from" ? selectionStartX.value : selectionEndX.value
  );
  const p1 = useDerivedValue(() => ({ x: x.value, y: top }));
  const p2 = useDerivedValue(() => ({ x: x.value, y: bottom }));
  const { positive, negative, segmentLine } = theme;
  const color = useDerivedValue(() => {
    if (stroke) {
      return stroke;
    }
    if (!trendKey) {
      return segmentLine;
    }
    return up.value ? positive : negative;
  });

  if (variant === "gradient") {
    // Gradient colour can't be animated per-trend cheaply; use the static stroke.
    const c = stroke ?? segmentLine;
    return (
      <Line opacity={opacity} p1={p1} p2={p2} strokeWidth={strokeWidth}>
        <LinearGradient
          colors={[withAlpha(c, 0), c, c, withAlpha(c, 0)]}
          end={vec(0, bottom)}
          positions={[0, 0.1, 0.9, 1]}
          start={vec(0, top)}
        />
      </Line>
    );
  }

  return (
    <Line
      color={color}
      opacity={opacity}
      p1={p1}
      p2={p2}
      strokeWidth={strokeWidth}
    >
      {variant === "dashed" ? <DashPathEffect intervals={[4, 4]} /> : null}
    </Line>
  );
}

export function SegmentLineFrom(props: SegmentLineProps) {
  return <SegmentLine {...props} edge="from" />;
}

export function SegmentLineTo(props: SegmentLineProps) {
  return <SegmentLine {...props} edge="to" />;
}

export interface SegmentChangeBadgeProps {
  /** Series whose % change across the selection is shown. */
  valueKey: string;
}

const BADGE_H = 20;
const BADGE_PAD_X = 7;
const BADGE_CHARS = "0123456789.,%+-";

/** % change across the selection, pinned above it (homepage badge). */
export function SegmentChangeBadge({ valueKey }: SegmentChangeBadgeProps) {
  const {
    data,
    width,
    fonts,
    theme,
    selectionStartX,
    selectionEndX,
    selectionStartIndex,
    selectionEndIndex,
  } = useChart();
  const opacity = useSelectionOpacity();

  const values = useMemo(
    () => data.map((d) => getNumber(d, valueKey)),
    [data, valueKey]
  );
  // Per-glyph widths so the worklet can measure labels without Skia calls.
  const charWidths = useMemo(() => {
    const widths: Record<string, number> = {};
    for (const ch of BADGE_CHARS) {
      widths[ch] = fonts.badge.getTextWidth(ch);
    }
    return widths;
  }, [fonts.badge]);

  const change = useDerivedValue(() => {
    const start = values[selectionStartIndex.value] ?? 0;
    const end = values[selectionEndIndex.value] ?? 0;
    return start === 0 ? 0 : (end - start) / start;
  });

  const label = useDerivedValue(() => {
    const pct = change.value * 100;
    const sign = pct >= 0 ? "+" : "-";
    return `${sign}${Math.abs(pct).toFixed(1)}%`;
  });

  const textWidth = useDerivedValue(() => {
    let w = 0;
    for (const ch of label.value) {
      w += charWidths[ch] ?? 0;
    }
    return w;
  });

  const badgeWidth = useDerivedValue(() => textWidth.value + BADGE_PAD_X * 2);
  const transform = useDerivedValue(() => {
    const center = (selectionStartX.value + selectionEndX.value) / 2;
    const w = badgeWidth.value;
    const x = Math.min(Math.max(center - w / 2, 0), width - w);
    return [{ translateX: x }, { translateY: 0 }];
  });

  const { positive, negative } = theme;
  const color = useDerivedValue(() =>
    change.value >= 0 ? positive : negative
  );

  return (
    <Group opacity={opacity} transform={transform}>
      <RoundedRect
        color={color}
        height={BADGE_H}
        r={4}
        width={badgeWidth}
        x={0}
        y={0}
      />
      <Text
        color="#ffffff"
        font={fonts.badge}
        text={label}
        x={BADGE_PAD_X}
        y={BADGE_H / 2 + 4}
      />
    </Group>
  );
}
