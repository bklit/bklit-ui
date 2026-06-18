"use client";

import {
  LiveLine,
  LiveLineChart,
  type LiveLinePoint,
  LiveXAxis,
  LiveYAxis,
} from "@bklitui/ui/charts";
import { useEffect, useRef, useState } from "react";
import { StudioReferenceAreaLayer } from "@/components/charts/studio-reference-area-layer";
import type { StudioFrameSize } from "@/components/studio-chart-viewport";
import type { CurveId } from "@/lib/curves";
import { resolveCurve } from "@/lib/curves";
import {
  studioCartesianBackgroundLayer,
  studioCartesianGridLayer,
} from "@/lib/studio-cartesian-layers";
import type { StudioUrlState } from "@/lib/studio-parsers";

const LIVE_LINE_MARGIN = { top: 24, right: 16, bottom: 32, left: 52 };

function useStudioLiveData(
  intervalMs: number,
  paused: boolean,
  windowSecs: number
) {
  const [data, setData] = useState<LiveLinePoint[]>([]);
  const [value, setValue] = useState(100);
  const priceRef = useRef(100);
  const momentumRef = useRef(0);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const nowSec = Date.now() / 1000;
    const seed: LiveLinePoint[] = [];
    let p = 100;
    const seedCount = Math.min(40, Math.max(10, Math.round(windowSecs)));
    for (let i = seedCount; i > 0; i--) {
      p *= 1 + (Math.random() - 0.48) * 0.01;
      seed.push({
        time: nowSec - i * (intervalMs / 1000),
        value: Math.round(p * 100) / 100,
      });
    }
    priceRef.current = p;
    setData(seed);
    setValue(p);
  }, [intervalMs, windowSecs]);

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) {
        return;
      }
      momentumRef.current =
        momentumRef.current * 0.88 + (Math.random() - 0.48) * 0.008;
      priceRef.current = Math.max(
        priceRef.current * (1 + momentumRef.current),
        1
      );
      const rounded = Math.round(priceRef.current * 100) / 100;
      setData((prev) => {
        const cutoff = Date.now() / 1000 - windowSecs;
        return [
          ...prev.filter((pt) => pt.time >= cutoff),
          { time: Date.now() / 1000, value: rounded },
        ];
      });
      setValue(rounded);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, windowSecs]);

  return { data, value };
}

export function LiveLineStudioPreview({
  state,
  intervalMs,
  paused,
  windowSecs,
  strokeWidth,
  stroke,
  curve,
  fill,
  pulse,
  badge,
  lerpSpeed,
  exaggerate,
  chartKey,
  frame,
}: {
  state: StudioUrlState;
  intervalMs: number;
  paused: boolean;
  windowSecs: number;
  strokeWidth: number;
  stroke: string;
  curve: CurveId;
  fill: boolean;
  pulse: boolean;
  badge: boolean;
  lerpSpeed: number;
  exaggerate: boolean;
  chartKey: string;
  frame: StudioFrameSize;
}) {
  const { data, value } = useStudioLiveData(intervalMs, paused, windowSecs);

  return (
    <LiveLineChart
      className="size-full"
      data={data}
      exaggerate={exaggerate}
      key={chartKey}
      lerpSpeed={lerpSpeed}
      margin={LIVE_LINE_MARGIN}
      paused={paused}
      style={{ height: frame.height, touchAction: "none" }}
      value={value}
      window={windowSecs}
    >
      {studioCartesianBackgroundLayer(
        state,
        "live-line.background",
        "live-line.grid"
      )}
      {studioCartesianGridLayer(state, "live-line.grid")}
      <StudioReferenceAreaLayer
        componentId="live-line.reference-area"
        state={state}
      />
      <LiveLine
        badge={badge}
        curve={resolveCurve(curve)}
        dataKey="value"
        fill={fill}
        pulse={pulse}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <LiveXAxis />
      <LiveYAxis />
    </LiveLineChart>
  );
}
