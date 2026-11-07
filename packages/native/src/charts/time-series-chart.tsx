import { Canvas, matchFont } from "@shopify/react-native-skia";
import { extent, max, min } from "d3-array";
import { scaleLinear, scaleTime } from "d3-scale";
import {
  Children,
  isValidElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type LayoutChangeEvent,
  Platform,
  type StyleProp,
  useColorScheme,
  View,
  type ViewStyle,
} from "react-native";
import {
  GestureDetector,
  type GestureTouchEvent,
  useCompetingGestures,
  usePanGesture,
} from "react-native-gesture-handler";
import {
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import {
  ChartContext,
  type ChartContextValue,
  type ChartFonts,
  type ChartSeries,
  getChartPlugin,
  getDate,
  type Margin,
  nearestIndex,
} from "./chart-context";
import {
  CHART_EASING,
  DOT_SPRING,
  EASE_IN_OUT,
  HOVER_DIM_MS,
  PANEL_ENTRANCE_SPRING,
  PANEL_FADE_MS,
  SEGMENT_FADE_MS,
} from "./motion";
import {
  type ChartSprings,
  type ChartTheme,
  DEFAULT_CHART_SPRINGS,
  darkChartTheme,
  lightChartTheme,
  toSpring,
} from "./theme";

export interface TimeSeriesChartProps {
  data: Record<string, unknown>[];
  xDataKey?: string;
  margin?: Partial<Margin>;
  /** Width ÷ height. Ignored when `height` is set. Default: 2 (web "2 / 1"). */
  aspectRatio?: number;
  height?: number;
  /** Reveal duration in ms. Default: 1100 (matches web). */
  animationDuration?: number;
  /** Override resolved light/dark tokens. */
  theme?: Partial<ChartTheme>;
  /** Override tooltip / panel / highlight / ticker springs. */
  springs?: Partial<ChartSprings>;
  /** JS-thread callback when the scrubbed index changes; `null` on release. */
  onActiveIndexChange?: (index: number | null) => void;
  /** Override the x domain (e.g. to leave room for a forecast). */
  xDomain?: [Date, Date];
  /** JS-thread callback when a two-finger selection settles on new indices. */
  onSelectionChange?: (range: { start: number; end: number } | null) => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

// Bottom 40 (web) leaves room for the 32px date pill centred under the plot.
const DEFAULT_MARGIN: Margin = { top: 16, right: 16, bottom: 40, left: 16 };
/** Gap between crosshair and floating panel (web tooltip-box offset). */
export const TOOLTIP_OFFSET = 16;

const fontFamily = Platform.select({
  ios: "Helvetica Neue",
  default: "sans-serif",
});

interface ChartLayoutInputs {
  series: ChartSeries[];
  yValues: number[];
  xValues: Date[];
}

/** Walk children (and fragments/groups) asking each plugin for its inputs. */
function collectInputs(
  children: ReactNode,
  data: Record<string, unknown>[],
  theme: ChartTheme
): ChartLayoutInputs {
  const out: ChartLayoutInputs = { series: [], yValues: [], xValues: [] };
  const visit = (node: ReactNode) => {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) {
        return;
      }
      const plugin = getChartPlugin(child.type);
      const props = child.props as Record<string, unknown>;
      if (plugin) {
        const s = plugin.series?.(props, out.series.length, theme);
        if (s) {
          out.series.push(s);
        }
        out.yValues.push(...(plugin.yValues?.(props, data) ?? []));
        out.xValues.push(...(plugin.xValues?.(props, data) ?? []));
        return;
      }
      const nested = props.children as ReactNode;
      if (nested) {
        visit(nested);
      }
    });
  };
  visit(children);
  return out;
}

function useScales({
  data,
  xDataKey,
  inputs,
  xDomain,
  margin,
  width,
  height,
}: {
  data: Record<string, unknown>[];
  xDataKey: string;
  inputs: ChartLayoutInputs;
  xDomain?: [Date, Date];
  margin: Margin;
  width: number;
  height: number;
}) {
  const xScale = useMemo(() => {
    const dates = [...data.map((d) => getDate(d, xDataKey)), ...inputs.xValues];
    const [min = new Date(), maxDate = new Date()] = xDomain ?? extent(dates);
    return scaleTime()
      .domain([min, maxDate])
      .range([margin.left, Math.max(margin.left, width - margin.right)]);
  }, [data, xDataKey, inputs, xDomain, margin, width]);

  const yScale = useMemo(() => {
    const values = inputs.yValues;
    const lo = Math.min(0, min(values) ?? 0);
    const hi = Math.max(0, max(values) ?? 1);
    return scaleLinear()
      .domain([lo, hi === lo ? lo + 1 : hi])
      .nice()
      .range([Math.max(margin.top, height - margin.bottom), margin.top]);
  }, [inputs, margin, height]);

  const xs = useMemo(
    () => data.map((d) => xScale(getDate(d, xDataKey))),
    [data, xScale, xDataKey]
  );

  return { xScale, yScale, xs };
}

export function TimeSeriesChart({
  data,
  xDataKey = "date",
  margin: marginProp,
  aspectRatio = 2,
  height: heightProp,
  animationDuration = 1100,
  theme: themeOverride,
  springs: springsOverride,
  xDomain,
  onActiveIndexChange,
  onSelectionChange,
  style,
  children,
}: TimeSeriesChartProps) {
  const scheme = useColorScheme();
  const reducedMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const height = heightProp ?? (width > 0 ? width / aspectRatio : 0);

  const theme = useMemo(
    () => ({
      ...(scheme === "dark" ? darkChartTheme : lightChartTheme),
      ...themeOverride,
    }),
    [scheme, themeOverride]
  );
  const springs = useMemo(() => {
    const merged = { ...DEFAULT_CHART_SPRINGS, ...springsOverride };
    return {
      tooltip: toSpring(merged.tooltip),
      tooltipBox: toSpring(merged.tooltipBox),
      highlight: toSpring(merged.highlight),
      ticker: toSpring(merged.ticker),
    };
  }, [springsOverride]);
  const margin = useMemo(
    () => ({ ...DEFAULT_MARGIN, ...marginProp }),
    [marginProp]
  );

  const fonts = useMemo<ChartFonts>(
    () => ({
      axis: matchFont({ fontFamily, fontSize: 11, fontWeight: "500" }),
      tooltip: matchFont({ fontFamily, fontSize: 13, fontWeight: "400" }),
      tooltipStrong: matchFont({ fontFamily, fontSize: 13, fontWeight: "600" }),
      ticker: matchFont({ fontFamily, fontSize: 14, fontWeight: "500" }),
      badge: matchFont({ fontFamily, fontSize: 11, fontWeight: "700" }),
    }),
    []
  );

  const inputs = useMemo(
    () => collectInputs(children, data, theme),
    [children, data, theme]
  );
  const series = inputs.series;

  const { xScale, yScale, xs } = useScales({
    data,
    xDataKey,
    inputs,
    xDomain,
    margin,
    width,
    height,
  });

  const revealProgress = useSharedValue(reducedMotion ? 1 : 0);
  const activeIndex = useSharedValue(0);
  const crosshairX = useSharedValue(0);
  const tooltipOpacity = useSharedValue(0);
  const boxX = useSharedValue(0);
  const boxWidth = useSharedValue(0);
  const tickerWidth = useSharedValue(0);
  const highlightX = useSharedValue(0);
  const highlightWidth = useSharedValue(0);
  const selectionStartX = useSharedValue(0);
  const selectionEndX = useSharedValue(0);
  const selectionStartIndex = useSharedValue(0);
  const selectionEndIndex = useSharedValue(0);
  const selectionOpacity = useSharedValue(0);
  const panelOpacity = useSharedValue(0);
  const panelEntrance = useSharedValue(1);
  const panelFlipped = useSharedValue(0);
  const dotEntrance = useSharedValue(1);
  const highlightOpacity = useSharedValue(0);

  // Worklets read layout through shared values so the gesture config can stay
  // stable across renders.
  const xsShared = useSharedValue(xs);
  const plotRight = useSharedValue(width - margin.right);
  const plotLeft = useSharedValue(margin.left);
  useEffect(() => {
    xsShared.value = xs;
    plotRight.value = width - margin.right;
    plotLeft.value = margin.left;
  }, [xs, width, margin, xsShared, plotRight, plotLeft]);

  const hasRevealed = useRef(false);
  useEffect(() => {
    if (width === 0 || hasRevealed.current) {
      return;
    }
    hasRevealed.current = true;
    revealProgress.value = reducedMotion
      ? 1
      : withTiming(1, { duration: animationDuration, easing: CHART_EASING });
  }, [width, reducedMotion, animationDuration, revealProgress]);

  const onIndexRef = useRef(onActiveIndexChange);
  onIndexRef.current = onActiveIndexChange;
  const notifyIndex = useCallback((index: number | null) => {
    onIndexRef.current?.(index);
  }, []);
  const onSelectionRef = useRef(onSelectionChange);
  onSelectionRef.current = onSelectionChange;
  const notifySelection = useCallback((start: number, end: number) => {
    onSelectionRef.current?.(start < 0 ? null : { start, end });
  }, []);

  const instant = reducedMotion;
  const tooltipSpring = springs.tooltip;
  const boxSpring = springs.tooltipBox;
  const highlightSpring = springs.highlight;

  const moveTo = (x: number, jump: boolean) => {
    "worklet";
    const arr = xsShared.value;
    const n = arr.length;
    if (n === 0) {
      return;
    }
    const i = nearestIndex(arr, x);
    const changed = i !== activeIndex.value;
    if (!(jump || changed)) {
      return;
    }
    activeIndex.value = i;
    const cx = arr[i] ?? 0;
    const w = boxWidth.value;
    const flip = cx + TOOLTIP_OFFSET + w > plotRight.value;
    const bx = flip ? cx - TOOLTIP_OFFSET - w : cx + TOOLTIP_OFFSET;
    const hx = arr[Math.max(0, i - 1)] ?? cx;
    const hw = (arr[Math.min(n - 1, i + 1)] ?? cx) - hx;
    if (!(jump || instant) && flip !== (panelFlipped.value === 1)) {
      // Web remounts the panel on flip, replaying its entrance.
      panelEntrance.value = 0;
      panelEntrance.value = withSpring(1, PANEL_ENTRANCE_SPRING);
    }
    panelFlipped.value = flip ? 1 : 0;
    if (jump || instant) {
      crosshairX.value = cx;
      boxX.value = bx;
      highlightX.value = hx;
      highlightWidth.value = hw;
    } else {
      crosshairX.value = withSpring(cx, tooltipSpring);
      boxX.value = withSpring(bx, boxSpring);
      highlightX.value = withSpring(hx, highlightSpring);
      highlightWidth.value = withSpring(hw, highlightSpring);
    }
    scheduleOnRN(notifyIndex, i);
  };

  const ms = (duration: number) => {
    "worklet";
    return instant ? 0 : duration;
  };

  // Web: crosshair, dots and ticker mount/unmount instantly; the panel fades
  // (100ms) and springs in; the series dim eases over 400ms.
  const show = () => {
    "worklet";
    tooltipOpacity.value = 1;
    panelOpacity.value = withTiming(1, { duration: ms(PANEL_FADE_MS) });
    highlightOpacity.value = withTiming(1, {
      duration: ms(HOVER_DIM_MS),
      easing: EASE_IN_OUT,
    });
    if (!instant) {
      panelEntrance.value = 0;
      panelEntrance.value = withSpring(1, PANEL_ENTRANCE_SPRING);
      dotEntrance.value = 0;
      dotEntrance.value = withSpring(1, DOT_SPRING);
    }
  };

  const hide = () => {
    "worklet";
    tooltipOpacity.value = 0;
    panelOpacity.value = withTiming(0, { duration: ms(PANEL_FADE_MS) });
    highlightOpacity.value = withTiming(0, {
      duration: ms(HOVER_DIM_MS),
      easing: EASE_IN_OUT,
    });
  };

  const scrub = usePanGesture({
    // One finger scrubs horizontally; vertical drags fall through to scroll.
    maxPointers: 1,
    activeOffsetX: [-6, 6],
    failOffsetY: [-12, 12],
    onBegin: (e) => {
      "worklet";
      selectionOpacity.value = withTiming(0, { duration: ms(SEGMENT_FADE_MS) });
      const hidden = tooltipOpacity.value === 0;
      moveTo(e.x, hidden);
      if (hidden) {
        show();
      }
    },
    onUpdate: (e) => {
      "worklet";
      moveTo(e.x, false);
    },
    onFinalize: () => {
      "worklet";
      hide();
      scheduleOnRN(notifyIndex, null);
    },
  });

  const updateSelection = (e: GestureTouchEvent) => {
    "worklet";
    const a = e.allTouches[0];
    const b = e.allTouches[1];
    const arr = xsShared.value;
    if (!(a && b) || arr.length < 2) {
      return;
    }
    const lo = Math.max(plotLeft.value, Math.min(a.x, b.x));
    const hi = Math.min(plotRight.value, Math.max(a.x, b.x));
    const si = nearestIndex(arr, lo);
    const ei = nearestIndex(arr, hi);
    selectionStartX.value = lo;
    selectionEndX.value = hi;
    if (si !== selectionStartIndex.value || ei !== selectionEndIndex.value) {
      selectionStartIndex.value = si;
      selectionEndIndex.value = ei;
      scheduleOnRN(notifySelection, si, ei);
    }
    if (tooltipOpacity.value !== 0) {
      hide();
    }
    if (selectionOpacity.value < 1) {
      selectionOpacity.value = withTiming(1, {
        duration: ms(SEGMENT_FADE_MS),
      });
    }
  };

  // Two fingers select a segment; it stays until the next touch.
  const select = usePanGesture({
    minPointers: 2,
    onTouchesDown: (e) => {
      "worklet";
      updateSelection(e);
    },
    onTouchesMove: (e) => {
      "worklet";
      updateSelection(e);
    },
  });

  const gesture = useCompetingGestures(scrub, select);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(Math.round(e.nativeEvent.layout.width));
  }, []);

  const ctx: ChartContextValue = {
    data,
    xDataKey,
    width,
    height,
    margin,
    xScale,
    yScale,
    series,
    xs,
    theme,
    fonts,
    springs,
    animationDuration,
    reducedMotion,
    revealProgress,
    activeIndex,
    crosshairX,
    tooltipOpacity,
    boxX,
    boxWidth,
    tickerWidth,
    highlightX,
    highlightWidth,
    selectionStartX,
    selectionEndX,
    selectionStartIndex,
    selectionEndIndex,
    selectionOpacity,
    panelOpacity,
    panelEntrance,
    panelFlipped,
    dotEntrance,
    highlightOpacity,
  };

  return (
    <View
      onLayout={onLayout}
      // Reserve the final height before the first layout (aspectRatio) so
      // a remount doesn't collapse the chart for a frame.
      style={[
        heightProp === undefined
          ? { width: "100%", aspectRatio }
          : { width: "100%", height: heightProp },
        style,
      ]}
    >
      {width > 0 && height > 0 ? (
        <GestureDetector gesture={gesture}>
          <Canvas style={{ width, height }}>
            {/* Context doesn't cross the Skia reconciler, so re-provide it. */}
            <ChartContext.Provider value={ctx}>
              {children}
            </ChartContext.Provider>
          </Canvas>
        </GestureDetector>
      ) : null}
    </View>
  );
}
