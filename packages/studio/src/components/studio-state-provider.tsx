"use client";

import { parseAsString, useQueryState } from "nuqs";
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  STUDIO_CHART_FRAME_HEIGHT,
  STUDIO_CHART_FRAME_WIDTH,
} from "@/components/studio-chart-frame";
import { heatmapChartDefaults } from "@/lib/heatmap-chart-defaults";
import {
  candlestickChartDefaults,
  lineChartProfitLossDefaults,
  lineChartStandardDefaults,
} from "@/lib/line-chart-mode";
import { getStudioConfig } from "@/lib/registry";
import { chartDefaultHiddenComponents } from "@/lib/studio-component-visibility";
import {
  defaultStudioState,
  defaultsForChart,
  type StudioUrlState,
} from "@/lib/studio-parsers";
import {
  decodeStudioUrlState,
  encodeStudioUrlState,
  STUDIO_URL_PARAM,
} from "@/lib/studio-url-codec";
import { loadStudioStateFromRequest } from "@/lib/studio-url-loader";
import {
  expandStudioParamUpdate,
  reconcileOverlayVisibility,
} from "@/lib/studio-visibility-sync";
import type { ChartSlug, StudioChartConfig } from "@/lib/types";

const STUDIO_Y_AXIS_CHART_PREFIX: Partial<Record<ChartSlug, string>> = {
  "line-chart": "line",
  "area-chart": "area",
  "scatter-chart": "scatter",
  "composed-chart": "composed",
  "bar-chart": "bar",
  "candlestick-chart": "candlestick",
  "live-line-chart": "live-line",
};

function finiteFrameDimension(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function normalizeLoadedState(loaded: StudioUrlState): StudioUrlState {
  return {
    ...loaded,
    frameW: finiteFrameDimension(loaded.frameW, STUDIO_CHART_FRAME_WIDTH),
    frameH: finiteFrameDimension(loaded.frameH, STUDIO_CHART_FRAME_HEIGHT),
  };
}

interface StudioShellContextValue {
  /** Committed URL state */
  state: StudioUrlState;
  config: StudioChartConfig;
  setChart: (slug: ChartSlug) => void;
  setParam: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  setStudioParams: (updates: Partial<StudioUrlState>) => void;
  setPreviewParam: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  setPreviewParams: (updates: Partial<StudioUrlState>) => void;
  commitParam: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  setFrameSize: (width: number, height: number) => void;
  /** Latest merged preview state (ref — does not subscribe shell consumers). */
  getDisplayState: () => StudioUrlState;
  motionCurveDragging: boolean;
  setMotionCurveDragging: (dragging: boolean) => void;
  numberScrubbing: boolean;
  setNumberScrubbing: (scrubbing: boolean) => void;
}

interface StudioDisplayContextValue {
  displayState: StudioUrlState;
}

const StudioShellContext = createContext<StudioShellContextValue | null>(null);
const StudioDisplayContext = createContext<StudioDisplayContextValue | null>(
  null
);

export function StudioStateProvider({
  children,
  embedded = false,
}: {
  children: React.ReactNode;
  /** Docs previews — stretch to the showcase min-height instead of editor flex shell. */
  embedded?: boolean;
}) {
  const [params, setParamsState] = useState<StudioUrlState>(defaultStudioState);
  const [compressed, setCompressed] = useQueryState(
    STUDIO_URL_PARAM,
    parseAsString.withDefault("")
  );

  const [previewOverrides, setPreviewOverrides] = useState<
    Partial<StudioUrlState>
  >({});
  const [motionCurveDragging, setMotionCurveDragging] = useState(false);
  const [numberScrubbing, setNumberScrubbing] = useState(false);
  const appliedYAxisHiddenDefault = useRef(false);
  const urlHydrated = useRef(false);
  const lastWrittenCompressed = useRef<string | null>(null);
  const suppressUrlCompress = useRef(false);

  const setParams = useCallback((updates: Partial<StudioUrlState>) => {
    setParamsState((prev) => {
      let next: StudioUrlState = { ...prev };
      for (const [key, value] of Object.entries(updates) as [
        keyof StudioUrlState,
        StudioUrlState[keyof StudioUrlState],
      ][]) {
        next = {
          ...next,
          ...expandStudioParamUpdate(next, { [key]: value }),
        };
      }
      return { ...next, ...reconcileOverlayVisibility(next) };
    });
  }, []);

  const state = useMemo(
    (): StudioUrlState => ({
      ...(params as StudioUrlState),
      frameW: finiteFrameDimension(params.frameW, STUDIO_CHART_FRAME_WIDTH),
      frameH: finiteFrameDimension(params.frameH, STUDIO_CHART_FRAME_HEIGHT),
    }),
    [params]
  );

  const displayState = useMemo(
    (): StudioUrlState => ({
      ...state,
      ...previewOverrides,
    }),
    [previewOverrides, state]
  );

  const displayStateRef = useRef(displayState);
  displayStateRef.current = displayState;

  const getDisplayState = useCallback(() => displayStateRef.current, []);

  const yAxisChartPrefix = STUDIO_Y_AXIS_CHART_PREFIX[state.chart as ChartSlug];

  useEffect(() => {
    if (Number.isFinite(params.frameW) && Number.isFinite(params.frameH)) {
      return;
    }
    setParams({
      frameW: finiteFrameDimension(params.frameW, STUDIO_CHART_FRAME_WIDTH),
      frameH: finiteFrameDimension(params.frameH, STUDIO_CHART_FRAME_HEIGHT),
    });
  }, [params.frameH, params.frameW, setParams]);

  useEffect(() => {
    if (params.chart !== "profit-loss-line") {
      return;
    }
    setParams({
      chart: "line-chart",
      ...lineChartProfitLossDefaults,
    });
  }, [params.chart, setParams]);

  useEffect(() => {
    if (!yAxisChartPrefix) {
      appliedYAxisHiddenDefault.current = false;
      return;
    }
    if (appliedYAxisHiddenDefault.current) {
      return;
    }
    appliedYAxisHiddenDefault.current = true;
    if (params.hiddenComponents !== "") {
      return;
    }
    setParams({
      hiddenComponents: chartDefaultHiddenComponents(yAxisChartPrefix, {
        showLegend: params.showLegend,
        showBrush: params.showBrush,
      }),
    });
  }, [
    params.hiddenComponents,
    params.showBrush,
    params.showLegend,
    setParams,
    yAxisChartPrefix,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset slider previews when chart changes via URL
  useEffect(() => {
    setPreviewOverrides({});
    setMotionCurveDragging(false);
    setNumberScrubbing(false);
  }, [params.chart]);

  useEffect(() => {
    if (urlHydrated.current) {
      return;
    }
    urlHydrated.current = true;
    suppressUrlCompress.current = true;

    const loaded = normalizeLoadedState(
      loadStudioStateFromRequest(new URL(window.location.href))
    );
    setParamsState({ ...loaded, ...reconcileOverlayVisibility(loaded) });

    const initialSerialized = new URL(window.location.href).searchParams.get(
      STUDIO_URL_PARAM
    );
    if (initialSerialized) {
      lastWrittenCompressed.current = initialSerialized;
    }
  }, []);

  useEffect(() => {
    if (!(urlHydrated.current && compressed)) {
      return;
    }
    if (compressed === lastWrittenCompressed.current) {
      return;
    }

    suppressUrlCompress.current = true;
    const decoded = normalizeLoadedState(decodeStudioUrlState(compressed));
    setParamsState({ ...decoded, ...reconcileOverlayVisibility(decoded) });
    lastWrittenCompressed.current = compressed;
  }, [compressed]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: state triggers clearing suppress after URL hydration
  useEffect(() => {
    if (!suppressUrlCompress.current) {
      return;
    }
    suppressUrlCompress.current = false;
  }, [state]);

  useEffect(() => {
    if (!urlHydrated.current || suppressUrlCompress.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      const encoded = encodeStudioUrlState(state);
      if (compressed !== encoded) {
        lastWrittenCompressed.current = encoded;
        setCompressed(encoded);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [compressed, setCompressed, state]);

  const config = useMemo(() => getStudioConfig(state.chart), [state.chart]);

  const applyLineChartMode = useCallback(
    (mode: StudioUrlState["lineChartMode"]) => {
      setPreviewOverrides({});
      setParams({
        lineChartMode: mode,
        ...(mode === "profitLoss"
          ? lineChartProfitLossDefaults
          : lineChartStandardDefaults),
      });
    },
    [setParams]
  );

  const setChart = useCallback(
    (slug: ChartSlug) => {
      setPreviewOverrides({});
      setParams({
        ...defaultsForChart(),
        chart: slug === "profit-loss-line" ? "line-chart" : slug,
        ...(slug === "live-line-chart" ? { curve: "monotoneX" } : {}),
        ...(slug === "profit-loss-line" ? lineChartProfitLossDefaults : {}),
        ...(slug === "line-chart" ? lineChartStandardDefaults : {}),
        ...(slug === "candlestick-chart" ? candlestickChartDefaults : {}),
        ...(slug === "heatmap-chart" ? heatmapChartDefaults : {}),
        ...(slug === "area-chart" || slug === "composed-chart"
          ? { dataSeries: 2 }
          : {}),
        ...(() => {
          const prefix = STUDIO_Y_AXIS_CHART_PREFIX[slug];
          return prefix && slug !== "line-chart"
            ? {
                hiddenComponents: chartDefaultHiddenComponents(prefix, {
                  showLegend: false,
                  showBrush: false,
                }),
              }
            : {};
        })(),
      });
    },
    [setParams]
  );

  const setStudioParams = useCallback(
    (updates: Partial<StudioUrlState>) => {
      if ("lineChartMode" in updates && updates.lineChartMode !== undefined) {
        applyLineChartMode(updates.lineChartMode);
        return;
      }
      setPreviewOverrides((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(updates) as (keyof StudioUrlState)[]) {
          delete next[key];
        }
        return next;
      });
      setParams(updates);
    },
    [applyLineChartMode, setParams]
  );

  const setParam = useCallback(
    <K extends keyof StudioUrlState>(key: K, value: StudioUrlState[K]) => {
      if (key === "lineChartMode") {
        applyLineChartMode(value as StudioUrlState["lineChartMode"]);
        return;
      }
      setPreviewOverrides((prev) => {
        if (!(key in prev)) {
          return prev;
        }
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setParams({ [key]: value });
    },
    [applyLineChartMode, setParams]
  );

  const setPreviewParam = useCallback(
    <K extends keyof StudioUrlState>(key: K, value: StudioUrlState[K]) => {
      startTransition(() => {
        setPreviewOverrides((prev) => {
          if (prev[key] === value) {
            return prev;
          }
          return { ...prev, [key]: value };
        });
      });
    },
    []
  );

  const setPreviewParams = useCallback((updates: Partial<StudioUrlState>) => {
    startTransition(() => {
      setPreviewOverrides((prev) => {
        const changed = (Object.keys(updates) as (keyof StudioUrlState)[]).some(
          (key) => prev[key] !== updates[key]
        );
        return changed ? { ...prev, ...updates } : prev;
      });
    });
  }, []);

  const commitParam = useCallback(
    <K extends keyof StudioUrlState>(key: K, value: StudioUrlState[K]) => {
      if (key === "lineChartMode") {
        applyLineChartMode(value as StudioUrlState["lineChartMode"]);
        return;
      }
      setPreviewOverrides((prev) => {
        if (!(key in prev)) {
          return prev;
        }
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setParams({ [key]: value });
    },
    [applyLineChartMode, setParams]
  );

  const setFrameSize = useCallback(
    (width: number, height: number) => {
      if (!Number.isFinite(width)) {
        return;
      }
      if (!Number.isFinite(height)) {
        return;
      }
      setParams({
        frameW: Math.round(width),
        frameH: Math.round(height),
      });
    },
    [setParams]
  );

  const shellValue = useMemo(
    (): StudioShellContextValue => ({
      state,
      config,
      setChart,
      setParam,
      setStudioParams,
      setPreviewParam,
      setPreviewParams,
      commitParam,
      setFrameSize,
      getDisplayState,
      motionCurveDragging,
      setMotionCurveDragging,
      numberScrubbing,
      setNumberScrubbing,
    }),
    [
      commitParam,
      config,
      getDisplayState,
      motionCurveDragging,
      numberScrubbing,
      setChart,
      setFrameSize,
      setParam,
      setStudioParams,
      setPreviewParam,
      setPreviewParams,
      state,
    ]
  );

  const displayValue = useMemo(
    (): StudioDisplayContextValue => ({ displayState }),
    [displayState]
  );

  return (
    <StudioShellContext.Provider value={shellValue}>
      <StudioDisplayContext.Provider value={displayValue}>
        <div
          className={
            embedded
              ? "min-h-[inherit] w-full"
              : "flex h-full min-h-0 flex-1 flex-col"
          }
        >
          {children}
        </div>
      </StudioDisplayContext.Provider>
    </StudioShellContext.Provider>
  );
}

function buildMemoryStudioState(
  initialState?: Partial<StudioUrlState>
): StudioUrlState {
  const loaded = normalizeLoadedState(
    defaultStudioState({
      chart: "area-chart",
      dataSeries: 2,
      ...initialState,
    })
  );
  const prefix = STUDIO_Y_AXIS_CHART_PREFIX[loaded.chart as ChartSlug];

  if (prefix && loaded.hiddenComponents === "") {
    return {
      ...loaded,
      hiddenComponents: chartDefaultHiddenComponents(prefix, {
        showLegend: loaded.showLegend,
        showBrush: loaded.showBrush,
      }),
    };
  }

  return loaded;
}

/** In-memory studio state for static homepage/docs previews (no URL sync). */
export function StudioMemoryStateProvider({
  children,
  embedded = false,
  initialState,
}: {
  children: React.ReactNode;
  embedded?: boolean;
  initialState?: Partial<StudioUrlState>;
}) {
  const state = useMemo(
    () => buildMemoryStudioState(initialState),
    [initialState]
  );
  const config = useMemo(() => getStudioConfig(state.chart), [state.chart]);
  const getDisplayState = useCallback(() => state, [state]);

  const shellValue = useMemo((): StudioShellContextValue => {
    const noop = () => undefined;

    return {
      state,
      config,
      setChart: noop,
      setParam: noop,
      setStudioParams: noop,
      setPreviewParam: noop,
      setPreviewParams: noop,
      commitParam: noop,
      setFrameSize: noop,
      getDisplayState,
      motionCurveDragging: false,
      setMotionCurveDragging: noop,
      numberScrubbing: false,
      setNumberScrubbing: noop,
    };
  }, [config, getDisplayState, state]);

  const displayValue = useMemo(
    (): StudioDisplayContextValue => ({ displayState: state }),
    [state]
  );

  return (
    <StudioShellContext.Provider value={shellValue}>
      <StudioDisplayContext.Provider value={displayValue}>
        <div
          className={
            embedded
              ? "flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden"
              : "flex h-full min-h-0 flex-1 flex-col"
          }
        >
          {children}
        </div>
      </StudioDisplayContext.Provider>
    </StudioShellContext.Provider>
  );
}

export function useStudioShellState() {
  const context = useContext(StudioShellContext);
  if (!context) {
    throw new Error(
      "useStudioShellState must be used within StudioStateProvider"
    );
  }
  return context;
}

/** Optional — docs previews omit `StudioStateProvider`. */
function noopSetNumberScrubbing(_scrubbing: boolean) {
  // Intentionally empty: chart preview is not mounted in docs demos.
}

export function useStudioNumberScrubbing() {
  return (
    useContext(StudioShellContext)?.setNumberScrubbing ?? noopSetNumberScrubbing
  );
}

export function useStudioDisplayState() {
  const context = useContext(StudioDisplayContext);
  if (!context) {
    throw new Error(
      "useStudioDisplayState must be used within StudioStateProvider"
    );
  }
  return context;
}

/** Full studio state — re-renders on preview ticks. Prefer shell + display hooks when possible. */
export function useStudioState() {
  const shell = useStudioShellState();
  const { displayState } = useStudioDisplayState();
  return { ...shell, displayState };
}
