"use client";

import {
  Area,
  AreaChart,
  Grid,
  PATTERN_PRESETS,
  PatternArea,
  PatternPreset,
  type PatternPresetMeta,
} from "@bklitui/ui/charts";
import { memo, useMemo, useState } from "react";
import { ChoiceControl, PillPicker } from "../regression/lab-controls";

const FAMILIES = [...new Set(PATTERN_PRESETS.map((p) => p.family))];

const FAMILY_OPTIONS = [
  { value: "all", label: `All (${PATTERN_PRESETS.length})` },
  ...FAMILIES.map((family) => ({
    value: family,
    label: `${family.charAt(0).toUpperCase()}${family.slice(1)} (${PATTERN_PRESETS.filter((p) => p.family === family).length})`,
  })),
];

type Scale = "1" | "1.5" | "2";
type Opacity = "0.25" | "0.5" | "0.75" | "1";
type ColorVar = "1" | "2" | "3" | "4" | "5";
type SeriesCount = "1" | "2";
type BaseFill = "none" | "tint";

/** Deterministic, slightly noisy 40-point series. */
const DATA = Array.from({ length: 40 }, (_, i) => {
  const t = i / 39;
  return {
    date: new Date(Date.UTC(2026, 0, 1 + i)),
    a: 52 + 26 * Math.sin(t * Math.PI * 2.1) + 9 * Math.sin(i * 1.7) + i * 0.6,
    b: 26 + 14 * Math.cos(t * Math.PI * 1.6) + 6 * Math.sin(i * 2.3),
  };
});

interface CardSettings {
  scale: number;
  opacity: number;
  colorIndex: number;
  seriesCount: number;
  baseFill: BaseFill;
}

const PatternCard = memo(function PatternCard({
  pattern,
  settings,
}: {
  pattern: PatternPresetMeta;
  settings: CardSettings;
}) {
  const series =
    settings.seriesCount === 2
      ? [
          { key: "a", color: settings.colorIndex },
          { key: "b", color: (settings.colorIndex % 5) + 1 },
        ]
      : [{ key: "a", color: settings.colorIndex }];

  return (
    <figure className="flex flex-col overflow-hidden rounded-xl border bg-card [contain-intrinsic-size:auto_240px] [content-visibility:auto]">
      <div className="h-44 w-full px-1 pt-3">
        <AreaChart
          animationDuration={0}
          className="size-full"
          data={DATA}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={{ aspectRatio: "unset", height: "100%" }}
        >
          <Grid horizontal numTicksRows={4} vertical={false} />
          {series.map((s) => (
            <PatternPreset
              color={`var(--chart-${s.color})`}
              id={`lab-${pattern.id}-${s.key}`}
              key={`def-${s.key}`}
              opacity={settings.opacity}
              preset={pattern.id}
              scale={settings.scale}
            />
          ))}
          {series.map((s) => (
            <PatternArea
              dataKey={s.key}
              fill={`url(#lab-${pattern.id}-${s.key})`}
              key={`fill-${s.key}`}
            />
          ))}
          {series.map((s) => (
            <Area
              animate={false}
              dataKey={s.key}
              fill={`var(--chart-${s.color})`}
              fillOpacity={settings.baseFill === "tint" ? 0.12 : 0}
              gradientToOpacity={settings.baseFill === "tint" ? 0.12 : 0}
              key={`line-${s.key}`}
              showHighlight={false}
              stroke={`var(--chart-${s.color})`}
              strokeWidth={1.5}
            />
          ))}
        </AreaChart>
      </div>
      <figcaption className="flex items-center justify-between gap-2 border-t px-3 py-2">
        <span className="truncate font-mono text-xs">{pattern.id}</span>
        <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
          {pattern.size}px
        </span>
      </figcaption>
    </figure>
  );
});

export function PatternLabClient() {
  const [family, setFamily] = useState("all");
  const [scale, setScale] = useState<Scale>("1");
  const [opacity, setOpacity] = useState<Opacity>("0.5");
  const [color, setColor] = useState<ColorVar>("1");
  const [seriesCount, setSeriesCount] = useState<SeriesCount>("1");
  const [baseFill, setBaseFill] = useState<BaseFill>("none");

  const settings = useMemo<CardSettings>(
    () => ({
      scale: Number(scale),
      opacity: Number(opacity),
      colorIndex: Number(color),
      seriesCount: Number(seriesCount),
      baseFill,
    }),
    [scale, opacity, color, seriesCount, baseFill]
  );

  const visible = PATTERN_PRESETS.filter(
    (p) => family === "all" || p.family === family
  );

  return (
    <>
      <header className="flex flex-col gap-1 border-b pb-4">
        <h1 className="font-medium text-xl">Pattern lab</h1>
        <p className="max-w-2xl text-muted-foreground text-sm">
          Every <code>PatternPreset</code> shipped in{" "}
          <code>@bklitui/ui/charts</code> (cells re-authored from Nucleo&apos;s
          free SVG patterns), as an <code>AreaChart</code> fill.
        </p>
      </header>

      <div className="sticky top-0 z-10 -mx-6 flex flex-col gap-3 border-b bg-background/90 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <ChoiceControl
            label="Tile scale"
            onChange={setScale}
            options={[
              { value: "1", label: "1×" },
              { value: "1.5", label: "1.5×" },
              { value: "2", label: "2×" },
            ]}
            value={scale}
          />
          <ChoiceControl
            label="Opacity"
            onChange={setOpacity}
            options={[
              { value: "0.25", label: "25%" },
              { value: "0.5", label: "50%" },
              { value: "0.75", label: "75%" },
              { value: "1", label: "100%" },
            ]}
            value={opacity}
          />
          <ChoiceControl
            label="Colour"
            onChange={setColor}
            options={(["1", "2", "3", "4", "5"] as const).map((value) => ({
              value,
              label: `chart-${value}`,
            }))}
            value={color}
          />
          <ChoiceControl
            label="Series"
            onChange={setSeriesCount}
            options={[
              { value: "1", label: "1" },
              { value: "2", label: "2" },
            ]}
            value={seriesCount}
          />
          <ChoiceControl
            label="Base fill"
            onChange={setBaseFill}
            options={[
              { value: "none", label: "None" },
              { value: "tint", label: "Tint" },
            ]}
            value={baseFill}
          />
        </div>
        <PillPicker
          label="Family"
          onChange={setFamily}
          options={FAMILY_OPTIONS}
          value={family}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {visible.map((pattern) => (
          <PatternCard key={pattern.id} pattern={pattern} settings={settings} />
        ))}
      </div>
    </>
  );
}
