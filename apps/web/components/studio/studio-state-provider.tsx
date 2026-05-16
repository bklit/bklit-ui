"use client";

import { useQueryStates } from "nuqs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  STUDIO_CHART_FRAME_HEIGHT,
  STUDIO_CHART_FRAME_WIDTH,
} from "@/components/studio/studio-chart-frame";
import { getStudioConfig } from "@/lib/studio/registry";
import {
  defaultsForChart,
  type StudioUrlState,
  studioSearchParams,
} from "@/lib/studio/studio-parsers";
import type { ChartSlug, StudioChartConfig } from "@/lib/studio/types";

function finiteFrameDimension(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

interface StudioStateContextValue {
  /** Committed URL state */
  state: StudioUrlState;
  /** URL state merged with in-flight slider previews (for chart render) */
  displayState: StudioUrlState;
  config: StudioChartConfig;
  setChart: (slug: ChartSlug) => void;
  setParam: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  setPreviewParam: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  commitParam: <K extends keyof StudioUrlState>(
    key: K,
    value: StudioUrlState[K]
  ) => void;
  setFrameSize: (width: number, height: number) => void;
}

const StudioStateContext = createContext<StudioStateContextValue | null>(null);

export function StudioStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [params, setParams] = useQueryStates(studioSearchParams, {
    shallow: true,
    history: "replace",
  });

  const [previewOverrides, setPreviewOverrides] = useState<
    Partial<StudioUrlState>
  >({});

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

  useEffect(() => {
    if (Number.isFinite(params.frameW) && Number.isFinite(params.frameH)) {
      return;
    }
    setParams({
      frameW: finiteFrameDimension(params.frameW, STUDIO_CHART_FRAME_WIDTH),
      frameH: finiteFrameDimension(params.frameH, STUDIO_CHART_FRAME_HEIGHT),
    });
  }, [params.frameH, params.frameW, setParams]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset slider previews when chart changes via URL
  useEffect(() => {
    setPreviewOverrides({});
  }, [params.chart]);

  const config = useMemo(() => getStudioConfig(state.chart), [state.chart]);

  const setChart = useCallback(
    (slug: ChartSlug) => {
      setPreviewOverrides({});
      setParams({
        ...defaultsForChart(),
        chart: slug,
        ...(slug === "live-line-chart" ? { curve: "monotoneX" } : {}),
      });
    },
    [setParams]
  );

  const setParam = useCallback(
    <K extends keyof StudioUrlState>(key: K, value: StudioUrlState[K]) => {
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
    [setParams]
  );

  const setPreviewParam = useCallback(
    <K extends keyof StudioUrlState>(key: K, value: StudioUrlState[K]) => {
      setPreviewOverrides((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const commitParam = useCallback(
    <K extends keyof StudioUrlState>(key: K, value: StudioUrlState[K]) => {
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
    [setParams]
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

  const value = useMemo(
    (): StudioStateContextValue => ({
      state,
      displayState,
      config,
      setChart,
      setParam,
      setPreviewParam,
      commitParam,
      setFrameSize,
    }),
    [
      commitParam,
      config,
      displayState,
      setChart,
      setFrameSize,
      setParam,
      setPreviewParam,
      state,
    ]
  );

  return (
    <StudioStateContext.Provider value={value}>
      {children}
    </StudioStateContext.Provider>
  );
}

export function useStudioState() {
  const context = useContext(StudioStateContext);
  if (!context) {
    throw new Error("useStudioState must be used within StudioStateProvider");
  }
  return context;
}
