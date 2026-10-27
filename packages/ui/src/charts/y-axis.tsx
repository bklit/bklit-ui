"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { memo, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  useChartPortalContainer,
  useChartStable,
  useSettledYScale,
  useYScale,
} from "./chart-context";
import { resolveReferenceDataRange } from "./reference-area-geometry";
import type { YAxisOrientation } from "./y-axis-scales";
import { normalizeYAxisId } from "./y-axis-scales";
import {
  resolveYAxisTickCount,
  Y_AXIS_DEFAULT_TICK_COUNT,
} from "./y-axis-ticks";

/** Vertical drift (px) of labels fading in / out on a y-domain change. */
const Y_AXIS_LABEL_SHIFT_PX = 8;
const Y_AXIS_LABEL_EASE_OUT = [0.23, 1, 0.32, 1] as const;
const Y_AXIS_LABEL_ENTER_S = 0.4;
const Y_AXIS_LABEL_EXIT_S = 0.25;
const Y_AXIS_LABEL_CLIP_BLEED_PX = 12;
/** Delay between consecutive entering labels (cascade). */
const Y_AXIS_LABEL_STAGGER_S = 0.05;

/**
 * Direction labels travel while the y-domain tweens: `-1` (up) when the
 * domain shrinks — values grow apart and rise — `1` (down) when it grows.
 */
type LabelDrift = -1 | 1;

interface LabelMotion {
  drift: LabelDrift;
  reducedMotion: boolean;
}

const labelVariants: Variants = {
  hidden: ({ drift }: LabelMotion) => ({
    opacity: 0,
    y: -drift * Y_AXIS_LABEL_SHIFT_PX,
  }),
  visible: { opacity: 1, y: 0 },
  exit: ({ drift, reducedMotion }: LabelMotion) => ({
    opacity: 0,
    y: drift * Y_AXIS_LABEL_SHIFT_PX,
    transition: {
      duration: reducedMotion ? 0 : Y_AXIS_LABEL_EXIT_S,
      ease: Y_AXIS_LABEL_EASE_OUT,
    },
  }),
};

export interface YAxisProps {
  /** Scale group id (Recharts `yAxisId`). Default: `"left"`. */
  yAxisId?: string | number;
  /** Which side of the chart to render labels. Default: `"left"`. */
  orientation?: YAxisOrientation;
  /**
   * Approximate tick count hint for `scale.ticks()` (d3). Actual label count may differ.
   * Clamped to {@link Y_AXIS_MIN_TICK_COUNT}–{@link Y_AXIS_MAX_TICK_COUNT}. Default: 5.
   */
  numTicks?: number;
  /** Format large numbers (e.g. 1000 as "1k"). Default: true */
  formatLargeNumbers?: boolean;
  /** Custom formatter for tick labels (e.g. USD). Overrides formatLargeNumbers when set. */
  formatValue?: (value: number) => string;
}

function formatLabel(
  value: number,
  formatLargeNumbers: boolean,
  formatValue?: (value: number) => string
): string {
  if (formatValue) {
    return formatValue(value);
  }
  if (formatLargeNumbers && value >= 1000) {
    // One decimal so 1500 reads "1.5k", not a second "2k".
    return `${Number((value / 1000).toFixed(1))}k`;
  }
  return String(value);
}

function resolveTickLabelColor(
  tickY: number,
  axisId: string,
  yScale: ReturnType<typeof useYScale>,
  referenceAreas: ReturnType<typeof useChartStable>["referenceAreas"]
): string | undefined {
  for (const area of referenceAreas) {
    if (!area.axisLabelColor) {
      continue;
    }
    if (normalizeYAxisId(area.yAxisId) !== axisId) {
      continue;
    }
    const [low, high] = resolveReferenceDataRange(
      area.y1,
      area.y2,
      yScale.domain() as [number, number]
    );
    const topPixel = yScale(high) ?? 0;
    const bottomPixel = yScale(low) ?? 0;
    const bandTop = Math.min(topPixel, bottomPixel);
    const bandBottom = Math.max(topPixel, bottomPixel);
    if (tickY >= bandTop && tickY <= bandBottom) {
      return area.axisLabelColor;
    }
  }
  return undefined;
}

export function YAxis(props: YAxisProps) {
  const { containerRef } = useChartStable();

  const container = useChartPortalContainer(containerRef);
  if (!container) {
    return null;
  }

  return <YAxisInner {...props} container={container} />;
}

const YAxisInner = memo(function YAxisInner({
  yAxisId,
  orientation = "left",
  numTicks = Y_AXIS_DEFAULT_TICK_COUNT,
  formatLargeNumbers = true,
  formatValue,
  container,
}: YAxisProps & { container: HTMLDivElement }) {
  const { margin, referenceAreas } = useChartStable();
  const yScale = useYScale(yAxisId);
  // Tick values come from the settled (target) domain so a y-domain tween
  // swaps one label set for the next once, instead of churning through every
  // intermediate tick set; positions still follow the live scale each frame.
  const settledYScale = useSettledYScale(yAxisId);
  const reducedMotion = useReducedMotion() ?? false;
  const isLeft = orientation === "left";
  const axisId = normalizeYAxisId(yAxisId);

  const [settledMin, settledMax] = settledYScale.domain() as [number, number];
  const settledSpan = settledMax - settledMin;
  const [prevSettledSpan, setPrevSettledSpan] = useState(settledSpan);
  const [drift, setDrift] = useState<LabelDrift>(-1);
  if (settledSpan !== prevSettledSpan) {
    setPrevSettledSpan(settledSpan);
    setDrift(settledSpan < prevSettledSpan ? -1 : 1);
  }

  const tickValues = useMemo(
    () => settledYScale.ticks(resolveYAxisTickCount(numTicks)),
    [settledYScale, numTicks]
  );

  const ticks = useMemo(() => {
    return tickValues.map((value) => {
      const y = (yScale(value) ?? 0) + margin.top;
      return {
        value,
        y,
        label: formatLabel(value, formatLargeNumbers, formatValue),
        labelColor: resolveTickLabelColor(
          y - margin.top,
          axisId,
          yScale,
          referenceAreas
        ),
      };
    });
  }, [
    tickValues,
    yScale,
    margin.top,
    formatLargeNumbers,
    formatValue,
    axisId,
    referenceAreas,
  ]);

  return createPortal(
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute overflow-hidden"
        style={{
          // Clip labels tweening in from far off-scale, with room for a
          // half-height edge label when the chart margin is tight.
          top: -Y_AXIS_LABEL_CLIP_BLEED_PX,
          bottom: -Y_AXIS_LABEL_CLIP_BLEED_PX,
          ...(isLeft
            ? { left: 0, width: margin.left }
            : { right: 0, width: margin.right }),
        }}
      >
        <AnimatePresence
          custom={{ drift, reducedMotion } satisfies LabelMotion}
          initial={false}
        >
          {ticks.map((tick, index) => {
            // Cascade in the direction of travel: bottom-up while labels
            // rise, top-down while they fall.
            const cascadeIndex = drift < 0 ? index : ticks.length - 1 - index;
            return (
              <motion.div
                animate="visible"
                className="absolute flex h-0 items-center"
                custom={{ drift, reducedMotion } satisfies LabelMotion}
                exit="exit"
                initial="hidden"
                key={tick.value}
                style={{
                  top: tick.y + Y_AXIS_LABEL_CLIP_BLEED_PX,
                  ...(isLeft
                    ? { right: 0, justifyContent: "flex-end", paddingRight: 8 }
                    : {
                        left: 0,
                        justifyContent: "flex-start",
                        paddingLeft: 8,
                      }),
                }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        delay: cascadeIndex * Y_AXIS_LABEL_STAGGER_S,
                        duration: Y_AXIS_LABEL_ENTER_S,
                        ease: Y_AXIS_LABEL_EASE_OUT,
                      }
                }
                variants={labelVariants}
              >
                <span
                  className="whitespace-nowrap text-chart-label text-xs"
                  style={
                    tick.labelColor ? { color: tick.labelColor } : undefined
                  }
                >
                  {tick.label}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>,
    container
  );
});

YAxis.displayName = "YAxis";

export default YAxis;
