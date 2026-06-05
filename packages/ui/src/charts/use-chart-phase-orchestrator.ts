"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ChartPhase,
  type ChartStatus,
  resolveRestingChartPhase,
} from "./chart-phase";

export interface UseChartPhaseOrchestratorOptions {
  chartStatus: ChartStatus;
  targetData: Record<string, unknown>[];
  skeletonData: Record<string, unknown>[];
  animationDuration: number;
  yDomainTweenDuration: number;
}

export function useChartPhaseOrchestrator({
  chartStatus,
  targetData,
  skeletonData,
  animationDuration,
  yDomainTweenDuration,
}: UseChartPhaseOrchestratorOptions) {
  const [chartPhase, setChartPhase] = useState<ChartPhase>(() =>
    resolveRestingChartPhase(chartStatus)
  );
  const [plotData, setPlotData] = useState<Record<string, unknown>[]>(() =>
    chartStatus === "loading" ? skeletonData : targetData
  );
  const [revealEpoch, setRevealEpoch] = useState(0);
  const [isLoaded, setIsLoaded] = useState(() => chartStatus === "ready");
  const prevStatusRef = useRef(chartStatus);
  const phaseRef = useRef(chartPhase);
  const pulseCompleteRef = useRef(false);
  const yDomainTweenCompleteRef = useRef(true);
  phaseRef.current = chartPhase;

  const tryAdvanceFromExiting = useCallback(() => {
    if (phaseRef.current !== "exiting") {
      return;
    }
    if (!(pulseCompleteRef.current && yDomainTweenCompleteRef.current)) {
      return;
    }
    setPlotData(targetData);
    setChartPhase("revealing");
  }, [targetData]);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    if (prevStatus === chartStatus) {
      return;
    }
    prevStatusRef.current = chartStatus;

    if (chartStatus === "ready" && prevStatus === "loading") {
      pulseCompleteRef.current = false;
      yDomainTweenCompleteRef.current = false;
      setChartPhase("exiting");
      setIsLoaded(false);
      return;
    }

    if (chartStatus === "loading" && prevStatus === "ready") {
      setChartPhase("exitingReady");
      setIsLoaded(false);
    }
  }, [chartStatus]);

  useEffect(() => {
    switch (chartPhase) {
      case "loading":
        if (chartStatus === "loading") {
          setPlotData(skeletonData);
        }
        break;
      case "exiting":
      case "revealing":
      case "ready":
        setPlotData(targetData);
        break;
      default:
        break;
    }
  }, [chartPhase, chartStatus, skeletonData, targetData]);

  useEffect(() => {
    if (chartPhase !== "exitingReady") {
      return;
    }

    setPlotData(targetData);
    const timer = window.setTimeout(() => {
      setPlotData(skeletonData);
      setChartPhase("loading");
    }, yDomainTweenDuration);
    return () => window.clearTimeout(timer);
  }, [chartPhase, skeletonData, targetData, yDomainTweenDuration]);

  const notifyLoadingPulseComplete = useCallback(() => {
    if (phaseRef.current !== "exiting") {
      return;
    }
    pulseCompleteRef.current = true;
    tryAdvanceFromExiting();
  }, [tryAdvanceFromExiting]);

  const notifyYDomainTweenComplete = useCallback(() => {
    if (phaseRef.current !== "exiting") {
      return;
    }
    yDomainTweenCompleteRef.current = true;
    tryAdvanceFromExiting();
  }, [tryAdvanceFromExiting]);

  useEffect(() => {
    if (chartPhase !== "revealing") {
      return;
    }

    setRevealEpoch((epoch) => epoch + 1);
    if (animationDuration <= 0) {
      setChartPhase("ready");
      setIsLoaded(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setChartPhase("ready");
      setIsLoaded(true);
    }, animationDuration);
    return () => window.clearTimeout(timer);
  }, [animationDuration, chartPhase]);

  return {
    chartPhase,
    plotData,
    revealEpoch,
    isLoaded,
    notifyLoadingPulseComplete,
    notifyYDomainTweenComplete,
  };
}
