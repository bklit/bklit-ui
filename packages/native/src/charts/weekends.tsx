import { Group, Rect, Skia } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { getDate, useChart } from "./chart-context";
import { EdgeFade, useEnterOpacity, usePlotRect } from "./fade-mask";
import { PatternFill, type PatternPreset } from "./patterns";

export interface WeekendsProps {
  /** "pattern" (default) or a flat "solid" wash. */
  variant?: "pattern" | "solid";
  pattern?: PatternPreset;
  /** Default: theme foregroundMuted. */
  color?: string;
  /** Default: 0.45 pattern / 0.08 solid (web). */
  opacity?: number;
  /** Default: 1.5 (web patternScale). */
  scale?: number;
  /** Fade the stripes top and bottom, % of plot height. Default: 0. */
  fadeVerticalLength?: number;
}

const DAY_MS = 86_400_000;

/** Saturday 00:00 → Monday 00:00 spans across the x domain. */
function weekendSpans(start: Date, end: Date): [Date, Date][] {
  const spans: [Date, Date][] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  // Back up to this week's Saturday so a span already in progress is kept.
  cursor.setDate(cursor.getDate() - ((cursor.getDay() + 1) % 7));
  while (cursor < end) {
    const sat = new Date(cursor);
    const mon = new Date(sat.getTime() + 2 * DAY_MS);
    mon.setHours(0, 0, 0, 0);
    if (mon > start) {
      spans.push([sat < start ? start : sat, mon > end ? end : mon]);
    }
    cursor.setDate(cursor.getDate() + 7);
  }
  return spans;
}

/** Hatched (or solid) weekend stripes (web `Weekends`). */
export function Weekends({
  variant = "pattern",
  pattern = "diagonal-up",
  color,
  opacity,
  scale = 1.5,
  fadeVerticalLength = 0,
}: WeekendsProps) {
  const { data, xDataKey, xScale, theme } = useChart();
  const rect = usePlotRect();
  const enter = useEnterOpacity();
  const tint = color ?? theme.foregroundMuted;

  const stripes = useMemo(() => {
    if (data.length === 0) {
      return [];
    }
    const [d0, d1] = xScale.domain();
    return weekendSpans(d0 ?? getDate(data[0] ?? {}, xDataKey), d1 ?? d0).map(
      ([a, b]) => {
        const x0 = xScale(a);
        return { key: a.getTime(), x: x0, width: xScale(b) - x0 };
      }
    );
  }, [data, xDataKey, xScale]);

  const clip = useMemo(() => {
    const b = Skia.PathBuilder.Make();
    for (const s of stripes) {
      b.addRect(Skia.XYWHRect(s.x, rect.y, s.width, rect.height));
    }
    return b.build();
  }, [stripes, rect.y, rect.height]);

  return (
    <Group opacity={enter}>
      <EdgeFade
        bottom={fadeVerticalLength}
        rect={rect}
        top={fadeVerticalLength}
      >
        {variant === "solid" ? (
          stripes.map((s) => (
            <Rect
              color={tint}
              height={rect.height}
              key={s.key}
              opacity={opacity ?? 0.08}
              width={s.width}
              x={s.x}
              y={rect.y}
            />
          ))
        ) : (
          <PatternFill
            clip={clip}
            color={tint}
            opacity={opacity ?? 0.45}
            preset={pattern}
            rect={rect}
            scale={scale}
          />
        )}
      </EdgeFade>
    </Group>
  );
}
