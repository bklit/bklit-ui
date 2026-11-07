import {
  Circle,
  DashPathEffect,
  Group,
  Paragraph,
  Path,
  Skia,
  Line as SkLine,
  type SkParagraph,
  Text,
  TextAlign,
  vec,
} from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { getDate, useChart } from "./chart-context";
import { EASE_OUT, PANEL_ENTRANCE_SPRING } from "./motion";

export interface ChartMarker {
  date: Date;
  title: string;
  description?: string;
  /** Emoji or short glyph for the badge. */
  icon?: string;
  /** Badge fill. Default: theme markerBackground. */
  color?: string;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Data index on the marker's calendar day, or -1. */
export function markerIndex(
  data: Record<string, unknown>[],
  xDataKey: string,
  date: Date
): number {
  return data.findIndex((d) => sameDay(getDate(d, xDataKey), date));
}

/** True while the crosshair sits on `index`. */
function useActive(index: number) {
  const { activeIndex, tooltipOpacity } = useChart();
  return useDerivedValue(
    () => tooltipOpacity.value > 0 && activeIndex.value === index
  );
}

// ─── Diamond markers (recipe) ────────────────────────────────────────────

export interface DiamondMarkersProps {
  items: ChartMarker[];
  /** Square side before the 45° turn. Default: 8. */
  size?: number;
  /** Centre offset above the plot top. Default: 12. */
  offset?: number;
}

/** Diamonds above the plot with dashed guides (diamond-markers recipe). */
export function DiamondMarkers({
  items,
  size = 8,
  offset = 12,
}: DiamondMarkersProps) {
  const { data, xDataKey, reducedMotion } = useChart();
  const enter = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    enter.value = withTiming(1, {
      duration: reducedMotion ? 0 : 300,
      easing: EASE_OUT,
    });
  }, [enter, reducedMotion]);

  return (
    <Group opacity={enter}>
      {items.map((m) => (
        <Diamond
          index={markerIndex(data, xDataKey, m.date)}
          key={`${m.date.getTime()}-${m.title}`}
          marker={m}
          offset={offset}
          size={size}
        />
      ))}
    </Group>
  );
}

function Diamond({
  marker,
  index,
  size,
  offset,
}: {
  marker: ChartMarker;
  index: number;
  size: number;
  offset: number;
}) {
  const { xScale, margin, height, theme } = useChart();
  const active = useActive(index);
  const x = xScale(marker.date);
  const cy = margin.top - offset;
  const half = (size * Math.SQRT2) / 2;
  const path = useMemo(() => {
    const b = Skia.PathBuilder.Make();
    b.moveTo(x, cy - half);
    b.lineTo(x + half, cy);
    b.lineTo(x, cy + half);
    b.lineTo(x - half, cy);
    b.close();
    return b.build();
  }, [x, cy, half]);
  const lineOpacity = useDerivedValue(() => (active.value ? 1 : 0.7));
  const { foregroundMuted, linePrimary, markerBorder } = theme;
  const fill = useDerivedValue(() =>
    active.value ? linePrimary : foregroundMuted
  );

  return (
    <>
      <SkLine
        color={markerBorder}
        opacity={lineOpacity}
        p1={vec(x, cy + half + 4)}
        p2={vec(x, height - margin.bottom)}
        strokeWidth={1}
      >
        <DashPathEffect intervals={[4, 4]} />
      </SkLine>
      <Path color={fill} path={path} />
    </>
  );
}

// ─── Event markers (ChartMarkers) ────────────────────────────────────────

export interface ChartMarkersProps {
  items: ChartMarker[];
  /** Badge radius. Default: 14 (web size 28). */
  radius?: number;
}

interface MarkerGroupData {
  key: number;
  index: number;
  date: Date;
  markers: ChartMarker[];
}

function useIconParagraph(icon: string, color: string): SkParagraph | null {
  return useMemo(() => {
    if (!icon) {
      return null;
    }
    const p = Skia.ParagraphBuilder.Make({ textAlign: TextAlign.Center })
      .pushStyle({ fontSize: 14, color: Skia.Color(color) })
      .addText(icon)
      .build();
    p.layout(28);
    return p;
  }, [icon, color]);
}

/** Emoji badges with dashed guides, grouped by day (web `ChartMarkers`). */
export function ChartMarkers({ items, radius = 14 }: ChartMarkersProps) {
  const { data, xDataKey } = useChart();
  const groups = useMemo(() => {
    const byDay = new Map<string, MarkerGroupData>();
    for (const m of items) {
      const key = m.date.toDateString();
      const g = byDay.get(key);
      if (g) {
        g.markers.push(m);
      } else {
        byDay.set(key, {
          key: m.date.getTime(),
          index: markerIndex(data, xDataKey, m.date),
          date: m.date,
          markers: [m],
        });
      }
    }
    return [...byDay.values()].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }, [items, data, xDataKey]);

  return (
    <>
      {groups.map((g, i) => (
        <MarkerBadge group={g} key={g.key} order={i} radius={radius} />
      ))}
    </>
  );
}

function MarkerBadge({
  group,
  order,
  radius,
}: {
  group: MarkerGroupData;
  order: number;
  radius: number;
}) {
  const {
    xScale,
    margin,
    height,
    theme,
    fonts,
    animationDuration,
    reducedMotion,
  } = useChart();
  const active = useActive(group.index);
  const x = xScale(group.date);
  const cy = margin.top - 8;
  const first = group.markers[0];
  const count = group.markers.length;
  const icon = useIconParagraph(first?.icon ?? "", theme.markerForeground);

  // Web entrance: scale 0.85 → 1 + fade, spring 300/25, after the reveal,
  // staggered 100ms per group.
  const enter = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    if (!reducedMotion) {
      enter.value = withDelay(
        animationDuration + order * 100,
        withSpring(1, PANEL_ENTRANCE_SPRING)
      );
    }
  }, [enter, reducedMotion, animationDuration, order]);
  const badgeTransform = useDerivedValue(() => [
    { scale: 0.85 + 0.15 * enter.value },
  ]);
  const badgeOpacity = useDerivedValue(() => Math.min(1, enter.value));

  // Guide: 0.6 at rest, hidden under the crosshair (200ms ease-out).
  const guide = useSharedValue(0.6);
  useAnimatedReaction(
    () => active.value,
    (isActive, was) => {
      if (was !== null && isActive !== was) {
        guide.value = withTiming(isActive ? 0 : 0.6, {
          duration: 200,
          easing: EASE_OUT,
        });
      }
    }
  );

  return (
    <>
      <SkLine
        color={theme.markerBorder}
        opacity={guide}
        p1={vec(x, margin.top + 18)}
        p2={vec(x, height - margin.bottom + 8)}
        strokeCap="round"
        strokeWidth={1}
      >
        <DashPathEffect intervals={[4, 4]} />
      </SkLine>
      <Group
        opacity={badgeOpacity}
        origin={vec(x, cy)}
        transform={badgeTransform}
      >
        <Circle color="rgba(0,0,0,0.15)" cx={x} cy={cy + 2} r={radius} />
        <Circle
          color={first?.color ?? theme.markerBackground}
          cx={x}
          cy={cy}
          r={radius}
        />
        <Circle
          color={theme.markerBorder}
          cx={x}
          cy={cy}
          r={radius}
          strokeWidth={1.5}
          style="stroke"
        />
        {icon ? (
          <Paragraph
            paragraph={icon}
            width={28}
            x={x - 14}
            y={cy - icon.getHeight() / 2}
          />
        ) : null}
        {count > 1 ? (
          <CountBadge
            color={theme.markerBadgeBackground}
            count={count}
            font={fonts.badge}
            textColor={theme.markerBadgeForeground}
            x={x + 16}
            y={cy - 16}
          />
        ) : null}
      </Group>
    </>
  );
}

function CountBadge({
  count,
  x,
  y,
  color,
  textColor,
  font,
}: {
  count: number;
  x: number;
  y: number;
  color: string;
  textColor: string;
  font: ReturnType<typeof useChart>["fonts"]["badge"];
}) {
  const label = String(count);
  const w = font.getTextWidth(label);
  return (
    <>
      <Circle color={color} cx={x} cy={y} r={9} />
      <Text
        color={textColor}
        font={font}
        text={label}
        x={x - w / 2}
        y={y + 4}
      />
    </>
  );
}
