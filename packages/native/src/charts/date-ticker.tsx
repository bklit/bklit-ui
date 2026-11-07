import {
  Group,
  RoundedRect,
  rect,
  type SkFont,
  Text,
} from "@shopify/react-native-skia";
import { useEffect, useMemo } from "react";
import {
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { getDate, useChart } from "./chart-context";

export interface DateTickerProps {
  /** Must produce "<month> <day>" style labels; split on the first space. */
  formatLabel?: (date: Date) => string;
}

// Web DateTicker: h-6 rows, px-4 / py-1 pill, gap-1 between stacks.
const ITEM_H = 24;
const PAD_X = 16;
const PAD_Y = 4;
const GAP = 4;
/** Measured widths are advance widths; pad so glyph edges aren't clipped. */
const WIDTH_SLACK = 2;
/** Stack clips extend this far so glyph overhang ("y", "f") isn't cut. */
const CLIP_BLEED = 2;
const PILL_H = ITEM_H + PAD_Y * 2;
/** Above this many points, roll the whole label as one stack (web: 60). */
const COMPACT_THRESHOLD = 60;

const defaultFormat = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

interface Stack {
  /** Unique consecutive values, e.g. ["Sep", "Oct"]. */
  values: string[];
  widths: number[];
  /** Data index → stack index. */
  indexOf: number[];
}

function toStack(parts: string[], font: SkFont): Stack {
  const values: string[] = [];
  const indexOf: number[] = [];
  for (const part of parts) {
    if (values.at(-1) !== part) {
      values.push(part);
    }
    indexOf.push(values.length - 1);
  }
  return {
    values,
    widths: values.map((v) =>
      v ? Math.ceil(font.getTextWidth(v)) + WIDTH_SLACK : 0
    ),
    indexOf,
  };
}

/**
 * The web DateTicker: a pill that rides the crosshair along the x-axis, with
 * month and day rolling vertically like NumberFlow. Every frame runs on the
 * UI thread; React only renders when data changes.
 */
export function DateTicker({ formatLabel = defaultFormat }: DateTickerProps) {
  const {
    data,
    xDataKey,
    width,
    height,
    margin,
    theme,
    fonts,
    springs,
    reducedMotion,
    activeIndex,
    crosshairX,
    tooltipOpacity,
    tickerWidth,
  } = useChart();

  const { month, day } = useMemo(() => {
    const labels = data.map((d) => formatLabel(getDate(d, xDataKey)));
    const compact = labels.length > COMPACT_THRESHOLD;
    const split = labels.map((label) => {
      if (compact) {
        return [label, ""] as const;
      }
      const space = label.indexOf(" ");
      return space < 0
        ? ([label, ""] as const)
        : ([label.slice(0, space), label.slice(space + 1)] as const);
    });
    return {
      month: toStack(
        split.map((s) => s[0]),
        fonts.ticker
      ),
      day: toStack(
        split.map((s) => s[1]),
        fonts.ticker
      ),
    };
  }, [data, xDataKey, formatLabel, fonts.ticker]);

  const monthY = useSharedValue(0);
  const dayY = useSharedValue(0);
  const monthW = useSharedValue(month.widths[0] ?? 0);
  const dayW = useSharedValue(day.widths[0] ?? 0);

  const spring = springs.ticker;

  const pillWidthFor = (m: number, d: number) => {
    "worklet";
    return PAD_X * 2 + m + (d > 0 ? GAP + d : 0);
  };

  useAnimatedReaction(
    () => activeIndex.value,
    (i) => {
      const mi = month.indexOf[i] ?? 0;
      const di = day.indexOf[i] ?? 0;
      const mw = month.widths[mi] ?? 0;
      const dw = day.widths[di] ?? 0;
      // Jump on first show so the pill doesn't roll in from the last date.
      const jump = reducedMotion || tooltipOpacity.value < 0.05;
      if (jump) {
        monthY.value = -mi * ITEM_H;
        dayY.value = -di * ITEM_H;
        monthW.value = mw;
        dayW.value = dw;
      } else {
        monthY.value = withSpring(-mi * ITEM_H, spring);
        dayY.value = withSpring(-di * ITEM_H, spring);
        monthW.value = withSpring(mw, spring);
        dayW.value = withSpring(dw, spring);
      }
      tickerWidth.value = pillWidthFor(mw, dw);
    }
  );

  // Clear the axis-label fade when the ticker unmounts.
  useEffect(
    () => () => {
      tickerWidth.value = 0;
    },
    [tickerWidth]
  );

  const pillWidth = useDerivedValue(() =>
    pillWidthFor(monthW.value, dayW.value)
  );
  const top = height - margin.bottom / 2 - PILL_H / 2;

  const pillTransform = useDerivedValue(() => {
    const w = pillWidth.value;
    const x = Math.min(Math.max(crosshairX.value - w / 2, 0), width - w);
    return [{ translateX: x }, { translateY: top }];
  });

  const monthClip = useDerivedValue(() =>
    rect(
      PAD_X - CLIP_BLEED,
      PAD_Y - CLIP_BLEED,
      monthW.value + CLIP_BLEED * 2,
      ITEM_H + CLIP_BLEED * 2
    )
  );
  const dayX = useDerivedValue(
    () => PAD_X + monthW.value + (dayW.value > 0 ? GAP : 0)
  );
  const dayClip = useDerivedValue(() =>
    rect(
      dayX.value - CLIP_BLEED,
      PAD_Y - CLIP_BLEED,
      dayW.value + CLIP_BLEED * 2,
      ITEM_H + CLIP_BLEED * 2
    )
  );
  const monthTransform = useDerivedValue(() => [
    { translateX: PAD_X + monthW.value / 2 },
    { translateY: PAD_Y + monthY.value },
  ]);
  const dayTransform = useDerivedValue(() => [
    { translateX: dayX.value + dayW.value / 2 },
    { translateY: PAD_Y + dayY.value },
  ]);

  return (
    <Group opacity={tooltipOpacity} transform={pillTransform}>
      <RoundedRect
        color={theme.tickerBackground}
        height={PILL_H}
        r={PILL_H / 2}
        width={pillWidth}
        x={0}
        y={0}
      />
      <Group clip={monthClip}>
        <Group transform={monthTransform}>
          <StackItems
            color={theme.tickerForeground}
            font={fonts.ticker}
            stack={month}
          />
        </Group>
      </Group>
      <Group clip={dayClip}>
        <Group transform={dayTransform}>
          <StackItems
            color={theme.tickerForeground}
            font={fonts.ticker}
            stack={day}
          />
        </Group>
      </Group>
    </Group>
  );
}

function StackItems({
  stack,
  font,
  color,
}: {
  stack: Stack;
  font: SkFont;
  color: string;
}) {
  const baseline = ITEM_H / 2 + font.getSize() * 0.36;
  return (
    <>
      {stack.values.map((value, k) =>
        value ? (
          <Text
            color={color}
            font={font}
            key={`${value}-${k}`}
            text={value}
            x={-(stack.widths[k] ?? 0) / 2}
            y={k * ITEM_H + baseline}
          />
        ) : null
      )}
    </>
  );
}
