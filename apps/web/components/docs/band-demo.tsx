"use client";

import {
  Band,
  type BandFillType,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  withBollingerBands,
  XAxis,
} from "@bklitui/ui/charts";
import { useState } from "react";
import {
  RadioGroupPrimitive,
  RadioPrimitive,
} from "@/components/ui/radio-group";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/ui/segmented-control";

const BAND_DEMO_POINT_COUNT = 24;
const BOLLINGER_DEMO_POINT_COUNT = 60;
export const BOLLINGER_DEMO_PERIOD = 10;

function bandDemoValue(index: number): number {
  const trend = 4.2 * index;
  const swell = Math.sin(index / 3.6) * 22;
  const ripple = Math.cos(index / 1.45) * 11;
  const jitter = Math.sin(index / 0.62) * 6;
  return Math.round(140 + trend + swell + ripple + jitter);
}

/**
 * Line + per-row min/max (Recharts BandedChart style). The spread varies
 * smoothly and asymmetrically so it reads like a real range.
 */
const rangeData = Array.from({ length: BAND_DEMO_POINT_COUNT }, (_, i) => {
  const value = bandDemoValue(i);
  return {
    date: new Date(2024, 0, i + 1),
    value,
    valueUpper: Math.round(
      value + value * 0.12 * (0.75 + 0.25 * Math.sin(i / 1.9))
    ),
    valueLower: Math.round(
      value - value * 0.12 * (0.75 + 0.25 * Math.cos(i / 2.6))
    ),
  };
});

function priceDemoValue(index: number): number {
  const trend = 1.6 * index;
  const swell = Math.sin(index / 6.5) * 26;
  const chop = Math.sin(index / 1.3) * 9 + Math.cos(index / 0.71) * 6;
  const shock = index > 34 && index < 44 ? Math.sin((index - 34) / 3) * 18 : 0;
  return Math.round(120 + trend + swell + chop + shock);
}

const priceData = Array.from(
  { length: BOLLINGER_DEMO_POINT_COUNT },
  (_, i) => ({
    date: new Date(2024, 0, i + 1),
    price: priceDemoValue(i),
  })
);

/** Adds priceUpper / priceLower / priceSma (null during the warm-up window). */
const bollingerData = withBollingerBands(priceData, {
  dataKey: "price",
  period: BOLLINGER_DEMO_PERIOD,
  multiplier: 2,
});

export function BandRangeDemo() {
  return (
    <div className="w-full">
      <LineChart data={rangeData}>
        <Grid horizontal />
        <Band
          fill="var(--chart-line-primary)"
          lowerKey="valueLower"
          strokeOpacity={0.4}
          upperKey="valueUpper"
        />
        <Line dataKey="value" stroke="var(--chart-line-primary)" />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function BandBollingerDemo() {
  return (
    <div className="w-full">
      <LineChart data={bollingerData}>
        <Grid horizontal />
        <Band
          fill="var(--chart-1)"
          fillOpacity={0.12}
          lowerKey="priceLower"
          strokeOpacity={0.5}
          upperKey="priceUpper"
        />
        {/* SMA: a zero-height band so the warm-up nulls render as a gap */}
        <Band
          fillOpacity={0}
          lowerKey="priceSma"
          lowerStroke={false}
          stroke="var(--chart-1)"
          strokeDasharray="4,4"
          strokeOpacity={0.8}
          upperKey="priceSma"
        />
        <Line
          dataKey="price"
          stroke="var(--chart-line-primary)"
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

const FILL_TYPES: { value: BandFillType; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
  { value: "pattern", label: "Pattern" },
];

export function BandFillTypeDemo() {
  const [fillType, setFillType] = useState<BandFillType>("gradient");

  return (
    <div className="w-full space-y-4">
      <SegmentedControl
        aria-label="Band fill type"
        render={
          <RadioGroupPrimitive
            onValueChange={(value) => setFillType(value as BandFillType)}
            value={fillType}
          />
        }
      >
        {FILL_TYPES.map((option) => (
          <SegmentedControlItem
            key={option.value}
            render={<RadioPrimitive.Root value={option.value} />}
          >
            {option.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      <LineChart data={rangeData}>
        <Grid horizontal />
        <Band
          fill="var(--chart-1)"
          fillOpacity={fillType === "gradient" ? 0.4 : 0.15}
          fillType={fillType}
          lowerKey="valueLower"
          pattern="diagonal"
          patternOpacity={0.6}
          strokeOpacity={0.5}
          upperKey="valueUpper"
        />
        <Line dataKey="value" stroke="var(--chart-1)" strokeWidth={2} />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function BandFadeEdgesDemo() {
  return (
    <div className="w-full">
      <LineChart data={rangeData}>
        <Grid horizontal />
        <Band
          fadeEdges={{ left: true, right: true }}
          fadeSize={0.2}
          fill="var(--chart-3)"
          fillOpacity={0.2}
          lowerKey="valueLower"
          strokeDasharray="4,4"
          strokeOpacity={0.7}
          upperKey="valueUpper"
        />
        <Line dataKey="value" stroke="var(--chart-3)" strokeWidth={2} />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function BandEdgeStrokesDemo() {
  return (
    <div className="w-full">
      <LineChart data={rangeData}>
        <Grid horizontal />
        <Band
          fill="var(--chart-line-primary)"
          fillOpacity={0.3}
          fillType="gradient"
          lowerKey="valueLower"
          lowerStroke={false}
          upperKey="valueUpper"
          upperStroke={{ strokeDasharray: "1,3", strokeWidth: 1.5 }}
        />
        <Line
          dataKey="value"
          stroke="var(--chart-line-primary)"
          strokeWidth={2}
        />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}
