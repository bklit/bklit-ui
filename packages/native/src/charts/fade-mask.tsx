import {
  Group,
  LinearGradient,
  Mask,
  Rect,
  vec,
} from "@shopify/react-native-skia";
import { type ReactNode, useEffect } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useChart } from "./chart-context";
import { EASE_OUT, ENTER_FADE_MS } from "./motion";
import type { PatternRect } from "./patterns";

const CLEAR = "rgba(0,0,0,0)";
const SOLID = "#000";

function stops(start: number, end: number) {
  const a = Math.min(45, Math.max(0, start)) / 100;
  const b = Math.min(45, Math.max(0, end)) / 100;
  return {
    colors: [a > 0 ? CLEAR : SOLID, SOLID, SOLID, b > 0 ? CLEAR : SOLID],
    positions: [0, a, 1 - b, 1],
  };
}

export interface EdgeFadeProps {
  rect: PatternRect;
  /** Fade zones as % of the rect, per edge (0–45). */
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  children: ReactNode;
}

/** Alpha-mask children so they fade out toward the chosen edges. */
export function EdgeFade({
  rect,
  left = 0,
  right = 0,
  top = 0,
  bottom = 0,
  children,
}: EdgeFadeProps) {
  if (left + right + top + bottom === 0) {
    return <>{children}</>;
  }
  const { x, y, width, height } = rect;
  const h = stops(left, right);
  const v = stops(top, bottom);
  return (
    <Mask
      mask={
        <Group>
          <Rect height={height} width={width} x={x} y={y}>
            <LinearGradient
              colors={h.colors}
              end={vec(x + width, 0)}
              positions={h.positions}
              start={vec(x, 0)}
            />
          </Rect>
          <Rect blendMode="dstIn" height={height} width={width} x={x} y={y}>
            <LinearGradient
              colors={v.colors}
              end={vec(0, y + height)}
              positions={v.positions}
              start={vec(0, y)}
            />
          </Rect>
        </Group>
      }
    >
      {children}
    </Mask>
  );
}

/** The plot area (inside margins). */
export function usePlotRect(): PatternRect {
  const { width, height, margin } = useChart();
  return {
    x: margin.left,
    y: margin.top,
    width: Math.max(0, width - margin.left - margin.right),
    height: Math.max(0, height - margin.top - margin.bottom),
  };
}

/** 0 → 1 over 420ms ease-out on mount, like web decorative layers. */
export function useEnterOpacity(duration = ENTER_FADE_MS) {
  const { reducedMotion } = useChart();
  const opacity = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: reducedMotion ? 0 : duration,
      easing: EASE_OUT,
    });
  }, [opacity, reducedMotion, duration]);
  return opacity;
}
