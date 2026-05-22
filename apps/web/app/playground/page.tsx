"use client";

import {
  ChartTooltip,
  Grid,
  Scatter,
  ScatterChart,
  XAxis,
} from "@bklitui/ui/charts";
import { useCallback, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const BASE_DATA = [
  { date: new Date("2024-01-01"), sessions: 420, conversions: 28 },
  { date: new Date("2024-02-01"), sessions: 510, conversions: 34 },
  { date: new Date("2024-03-01"), sessions: 390, conversions: 22 },
  { date: new Date("2024-04-01"), sessions: 580, conversions: 41 },
  { date: new Date("2024-05-01"), sessions: 620, conversions: 38 },
  { date: new Date("2024-06-01"), sessions: 710, conversions: 52 },
  { date: new Date("2024-07-01"), sessions: 680, conversions: 47 },
  { date: new Date("2024-08-01"), sessions: 760, conversions: 55 },
  { date: new Date("2024-09-01"), sessions: 820, conversions: 61 },
  { date: new Date("2024-10-01"), sessions: 790, conversions: 58 },
  { date: new Date("2024-11-01"), sessions: 910, conversions: 64 },
  { date: new Date("2024-12-01"), sessions: 980, conversions: 72 },
];

function LabeledRange({
  id,
  label,
  max,
  min,
  onChange,
  step,
  value,
  valueLabel,
}: {
  id: string;
  label: string;
  max: number;
  min: number;
  onChange: (n: number) => void;
  step?: number;
  value: number;
  valueLabel?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="font-medium text-foreground text-sm" htmlFor={id}>
          {label}
        </label>
        <span className="tabular-nums text-muted-foreground text-xs">
          {valueLabel ?? value}
        </span>
      </div>
      <input
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
        id={id}
        max={max}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step ?? 1}
        type="range"
        value={value}
      />
    </div>
  );
}

export default function PlaygroundPage() {
  const baseId = useId();
  const [revealSignature, setRevealSignature] = useState("initial");

  const [radius, setRadius] = useState(6);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [ringGap, setRingGap] = useState(2);
  const [outlineWidth, setOutlineWidth] = useState(0);
  const [inactiveOpacity, setInactiveOpacity] = useState(0.5);
  const [animationDuration, setAnimationDuration] = useState(1100);
  const [showGrid, setShowGrid] = useState(true);
  const [showSecondSeries, setShowSecondSeries] = useState(true);
  const [fadeOnHover, setFadeOnHover] = useState(true);
  const [numTicks, setNumTicks] = useState(6);

  const data = useMemo(() => BASE_DATA, []);

  const replay = useCallback(() => {
    setRevealSignature(String(Date.now()));
  }, []);

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-6xl gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-4">
          <div>
            <h1 className="font-bold text-2xl">Scatter chart playground</h1>
            <p className="text-muted-foreground text-sm">
              Composable <code className="text-xs">ScatterChart</code> with{" "}
              <code className="text-xs">XAxis</code>, crosshair tooltip, and
              clip-reveal animation — same shell as{" "}
              <code className="text-xs">LineChart</code>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={replay} type="button" variant="secondary">
              Replay animation
            </Button>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <ScatterChart
              animationDuration={animationDuration}
              data={data}
              revealSignature={revealSignature}
            >
              {showGrid ? <Grid horizontal /> : null}
              <Scatter
                dataKey="sessions"
                fadeOnHover={fadeOnHover}
                inactiveOpacity={inactiveOpacity}
                outlineWidth={outlineWidth}
                radius={radius}
                ringGap={ringGap}
                strokeWidth={strokeWidth}
              />
              {showSecondSeries ? (
                <Scatter
                  dataKey="conversions"
                  fadeOnHover={fadeOnHover}
                  inactiveOpacity={inactiveOpacity}
                  outlineWidth={outlineWidth}
                  radius={radius}
                  ringGap={ringGap}
                  strokeWidth={strokeWidth}
                />
              ) : null}
              <XAxis numTicks={numTicks} />
              <ChartTooltip />
            </ScatterChart>
          </div>
        </div>

        <aside className="mt-10 max-h-[calc(100vh-5rem)] space-y-4 overflow-y-auto rounded-lg border border-border bg-card p-5 lg:mt-0">
          <h2 className="font-semibold text-foreground text-sm">Controls</h2>

          <LabeledRange
            id={`${baseId}-radius`}
            label="Point radius"
            max={14}
            min={3}
            onChange={setRadius}
            value={radius}
            valueLabel={`${radius}px`}
          />
          <LabeledRange
            id={`${baseId}-stroke`}
            label="Ring stroke width"
            max={6}
            min={0}
            onChange={setStrokeWidth}
            value={strokeWidth}
            valueLabel={`${strokeWidth}px`}
          />
          <LabeledRange
            id={`${baseId}-ring-gap`}
            label="Ring gap (offset)"
            max={8}
            min={0}
            onChange={setRingGap}
            value={ringGap}
            valueLabel={`${ringGap}px`}
          />
          <LabeledRange
            id={`${baseId}-outline`}
            label="Outer outline width"
            max={6}
            min={0}
            onChange={setOutlineWidth}
            value={outlineWidth}
            valueLabel={`${outlineWidth}px`}
          />
          <LabeledRange
            id={`${baseId}-inactive-opacity`}
            label="Inactive opacity on hover"
            max={1}
            min={0.1}
            onChange={setInactiveOpacity}
            step={0.05}
            value={inactiveOpacity}
            valueLabel={`${Math.round(inactiveOpacity * 100)}%`}
          />
          <LabeledRange
            id={`${baseId}-duration`}
            label="Animation duration"
            max={2000}
            min={400}
            onChange={setAnimationDuration}
            step={100}
            value={animationDuration}
            valueLabel={`${animationDuration}ms`}
          />
          <LabeledRange
            id={`${baseId}-ticks`}
            label="X-axis ticks"
            max={8}
            min={3}
            onChange={setNumTicks}
            value={numTicks}
          />

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              checked={showGrid}
              className="size-4 rounded border border-input accent-foreground"
              onChange={(e) => setShowGrid(e.target.checked)}
              type="checkbox"
            />
            Show horizontal grid
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              checked={showSecondSeries}
              className="size-4 rounded border border-input accent-foreground"
              onChange={(e) => setShowSecondSeries(e.target.checked)}
              type="checkbox"
            />
            Second series (conversions)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              checked={fadeOnHover}
              className="size-4 rounded border border-input accent-foreground"
              onChange={(e) => setFadeOnHover(e.target.checked)}
              type="checkbox"
            />
            Fade non-active points on hover
          </label>
        </aside>
      </div>
    </div>
  );
}
