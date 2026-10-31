"use client";

import {
  Background,
  Candlestick,
  CandlestickChart,
  ChartTooltip,
  Deadline,
  Grid,
  LinearGradient,
  PatternLines,
  ReferenceArea,
  Weekends,
  XAxis,
  YAxis,
} from "@bklitui/ui/charts";
import type { ComponentProps } from "react";
import { galleryMargin } from "./bar-data";
import {
  CandlestickTooltipContent,
  candlestickChartPaletteIndicatorColor,
  candlestickIndicatorColor,
  candlestickOhlcData,
  docsOhlcData,
} from "./candlestick-data";
import type { LabVariant } from "./types";

const EXAMPLES = "chart-examples.tsx";
const PROPS = "candlestick-chart.mdx / CandlestickProps (no ported example)";

/** Gallery `CandlestickExampleChart` = CandlestickChart + desktop example margin, 320px tall. */
function GalleryCandlestickChart({
  margin,
  style = { height: 320 },
  ...props
}: Omit<ComponentProps<typeof CandlestickChart>, "data"> & {
  data?: ComponentProps<typeof CandlestickChart>["data"];
}) {
  return (
    <CandlestickChart
      data={candlestickOhlcData}
      {...props}
      margin={galleryMargin(margin)}
      style={style}
    />
  );
}

export const CANDLESTICK_VARIANTS: readonly LabVariant[] = [
  {
    kind: "single",
    id: "hero",
    label: "Hero (palette, matched crosshair)",
    source: `${EXAMPLES}: makeCandlestickHero`,
    exercises:
      "--chart-1 / --chart-5 fills, indicatorColor per candle, no dot, fadedOpacity={0.25}",
    render: () => (
      <GalleryCandlestickChart>
        <Candlestick
          fadedOpacity={0.25}
          negativeFill="var(--chart-5)"
          positiveFill="var(--chart-1)"
        />
        <ChartTooltip
          content={CandlestickTooltipContent}
          indicatorColor={candlestickChartPaletteIndicatorColor}
          showDots={false}
        />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "gradient-matched-crosshair",
    label: "Gradients + matched crosshair",
    source: `${EXAMPLES}: Candlestick – Tooltip line matches candle`,
    exercises: "url(#gradient) fills, trend-colored crosshair",
    render: () => (
      <GalleryCandlestickChart>
        <LinearGradient
          from="var(--color-lime-400)"
          id="candlestick-hero-up"
          to="var(--color-emerald-500)"
        />
        <LinearGradient
          from="var(--color-yellow-400)"
          id="candlestick-hero-down"
          to="var(--color-red-500)"
        />
        <Candlestick
          fadedOpacity={0.25}
          negativeFill="url(#candlestick-hero-down)"
          positiveFill="url(#candlestick-hero-up)"
        />
        <ChartTooltip
          content={CandlestickTooltipContent}
          indicatorColor={candlestickIndicatorColor}
          showDots={false}
        />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "chart-1-3",
    label: "Chart 1 & 3",
    source: `${EXAMPLES}: Candlestick – Chart 1 & 3`,
    exercises: "solid token fills with default crosshair + dots",
    render: () => (
      <GalleryCandlestickChart>
        <Candlestick
          fadedOpacity={0.25}
          negativeFill="var(--chart-3)"
          positiveFill="var(--chart-1)"
        />
        <ChartTooltip content={CandlestickTooltipContent} />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "gradients",
    label: "Lime → emerald, yellow → red",
    source: `${EXAMPLES}: Candlestick – Lime to emerald, yellow to red`,
    exercises: "gradient fills with the default crosshair and dots",
    render: () => (
      <GalleryCandlestickChart>
        <LinearGradient
          from="var(--color-lime-400)"
          id="candlestick-lime-emerald"
          to="var(--color-emerald-500)"
        />
        <LinearGradient
          from="var(--color-yellow-400)"
          id="candlestick-yellow-red"
          to="var(--color-red-500)"
        />
        <Candlestick
          fadedOpacity={0.25}
          negativeFill="url(#candlestick-yellow-red)"
          positiveFill="url(#candlestick-lime-emerald)"
        />
        <ChartTooltip content={CandlestickTooltipContent} />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "solid-fixed-width",
    label: "Solid colors, candleWidth 8",
    source: `${EXAMPLES}: Candlestick – Solid colors`,
    exercises: "candleWidth={8} (fixed px instead of candleGap), default fade",
    render: () => (
      <GalleryCandlestickChart candleWidth={8}>
        <Candlestick
          negativeFill="var(--color-red-500)"
          positiveFill="var(--color-emerald-500)"
        />
        <ChartTooltip content={CandlestickTooltipContent} />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "pattern",
    label: "Pattern bodies",
    source: `${EXAMPLES}: Candlestick – Pattern`,
    exercises:
      "candleGap={0.15}, bodyPatternPositive/Negative, insideStrokeWidth={1}",
    render: () => (
      <GalleryCandlestickChart candleGap={0.15}>
        <PatternLines
          height={8}
          id="candle-pattern-up"
          orientation={["diagonal"]}
          stroke="rgba(0,0,0,0.35)"
          strokeWidth={1.5}
          width={8}
        />
        <PatternLines
          height={8}
          id="candle-pattern-down"
          orientation={["diagonal"]}
          stroke="rgba(0,0,0,0.35)"
          strokeWidth={1.5}
          width={8}
        />
        <Candlestick
          bodyPatternNegative="url(#candle-pattern-down)"
          bodyPatternPositive="url(#candle-pattern-up)"
          insideStrokeWidth={1}
        />
        <ChartTooltip content={CandlestickTooltipContent} />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "tooltip-only",
    label: "Tooltip only",
    source: `${EXAMPLES}: Candlestick – Tooltip only`,
    exercises: "showCrosshair={false} showDots={false}",
    render: () => (
      <GalleryCandlestickChart>
        <Candlestick fadedOpacity={0.25} />
        <ChartTooltip
          content={CandlestickTooltipContent}
          showCrosshair={false}
          showDots={false}
        />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "background-pattern",
    label: "Pattern background",
    source: `${EXAMPLES}: Candlestick - Pattern Background`,
    exercises: "Background (diagonal) behind candles",
    render: () => (
      <GalleryCandlestickChart>
        <Background />
        <Candlestick fadedOpacity={0.25} />
        <ChartTooltip content={CandlestickTooltipContent} />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "background-dots",
    label: "Dot grid background",
    source: `${EXAMPLES}: Candlestick - Dot Grid Background`,
    exercises: 'Background pattern="dots"',
    render: () => (
      <GalleryCandlestickChart>
        <Background opacity={0.85} pattern="dots" />
        <Candlestick fadedOpacity={0.25} />
        <ChartTooltip content={CandlestickTooltipContent} />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "reference-band",
    label: "Reference band",
    source: `${EXAMPLES}: Candlestick - Reference Band`,
    exercises: "ReferenceArea y1={98} y2={108} dashed with markers",
    render: () => (
      <GalleryCandlestickChart>
        <ReferenceArea showMarkers strokeStyle="dashed" y1={98} y2={108} />
        <Candlestick fadedOpacity={0.25} />
        <ChartTooltip content={CandlestickTooltipContent} />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "reference-band-pattern",
    label: "Pattern reference band",
    source: `${EXAMPLES}: Candlestick - Pattern Reference Band`,
    exercises: "ReferenceArea pattern + axis label colour",
    render: () => (
      <GalleryCandlestickChart>
        <ReferenceArea
          axisLabelColor="var(--chart-1)"
          fillOpacity={0.85}
          pattern="diagonal"
          patternColor="var(--chart-foreground-muted)"
          y1={98}
          y2={108}
        />
        <Candlestick fadedOpacity={0.25} />
        <ChartTooltip content={CandlestickTooltipContent} />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "docs",
    label: "Docs (10 fixed candles)",
    source:
      "docs/candlestick-chart-demo.tsx: CandlestickChartDemo (+ candlestick-tooltip-demo.tsx)",
    exercises:
      "default --chart-positive / --chart-negative fills, margin 16, 10 candles",
    render: () => (
      <div className="w-full">
        <CandlestickChart
          data={docsOhlcData}
          margin={{ top: 16, right: 16, bottom: 40, left: 16 }}
          style={{ height: 320 }}
        >
          <Candlestick fadedOpacity={0.25} />
          <ChartTooltip content={CandlestickTooltipContent} />
          <XAxis />
        </CandlestickChart>
      </div>
    ),
  },
  {
    kind: "single",
    id: "docs-usage-grid",
    label: "Grid + docs data",
    source: "candlestick-chart.mdx: Basic Example (adds Grid horizontal)",
    exercises: "Grid on the candlestick y scale",
    render: () => (
      <div className="w-full">
        <CandlestickChart
          data={docsOhlcData}
          margin={{ top: 16, right: 16, bottom: 40, left: 16 }}
          style={{ height: 320 }}
        >
          <Grid horizontal />
          <Candlestick fadedOpacity={0.25} />
          <ChartTooltip content={CandlestickTooltipContent} />
          <XAxis />
        </CandlestickChart>
      </div>
    ),
  },
  {
    kind: "single",
    id: "y-axis",
    label: "Left Y axis",
    source: `${PROPS}: YAxis child`,
    exercises: "YAxis ticks on the candlestick price scale",
    render: () => (
      <GalleryCandlestickChart margin={{ top: 8, left: 56 }}>
        <Grid horizontal />
        <Candlestick fadedOpacity={0.25} />
        <YAxis formatValue={(v) => `$${v.toFixed(0)}`} />
        <ChartTooltip content={CandlestickTooltipContent} />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "weekends-deadline",
    label: "Weekends + deadline",
    source: "weekends.mdx / deadline.mdx (CandlestickChart listed as a host)",
    exercises: "Weekends and Deadline on the candlestick time scale",
    render: () => (
      <GalleryCandlestickChart>
        <Weekends />
        <Deadline date={new Date(2024, 0, 22)} label="Expiry" />
        <Candlestick fadedOpacity={0.25} />
        <ChartTooltip content={CandlestickTooltipContent} />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "x-domain",
    label: "xDomain window",
    source: `${PROPS}: xDomain + xDomainSlotCount (brush contract)`,
    exercises: "x scale from an explicit 2-week window, padding for 30 slots",
    render: () => (
      <GalleryCandlestickChart
        xDomain={[new Date(2024, 0, 8), new Date(2024, 0, 21)]}
        xDomainSlotCount={30}
      >
        <Candlestick fadedOpacity={0.25} />
        <ChartTooltip content={CandlestickTooltipContent} />
        <XAxis />
      </GalleryCandlestickChart>
    ),
  },
  {
    kind: "single",
    id: "no-animation-no-fade",
    label: "animate={false}, no hover fade, aspect 2 / 1",
    source: `${PROPS}: Candlestick animate, showHoverFade; CandlestickChart aspectRatio`,
    exercises:
      "candles at final geometry without enter, hover leaves others opaque, default aspect instead of style height",
    render: () => (
      <CandlestickChart data={candlestickOhlcData} margin={galleryMargin()}>
        <Candlestick animate={false} showHoverFade={false} />
        <ChartTooltip content={CandlestickTooltipContent} />
        <XAxis />
      </CandlestickChart>
    ),
  },
];
