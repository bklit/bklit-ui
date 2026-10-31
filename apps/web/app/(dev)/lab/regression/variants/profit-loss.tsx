"use client";

import {
  Background,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  ProfitLossLegend,
  ProfitLossLegendHoverProvider,
  ProfitLossLine,
  profitLossColor,
  ReferenceArea,
  resolveProfitLossTooltipLabel,
  XAxis,
  YAxis,
} from "@bklitui/ui/charts";
import { curveLinear, curveMonotoneX } from "d3-shape";
import { type ReactNode, useState } from "react";
import {
  PROFIT_LOSS_DATA_KEY,
  profitLossLineDocsData,
} from "@/components/docs/profit-loss-line-docs-data";
import { EXAMPLE_MARGIN } from "./line-data";
import type { LabVariant } from "./types";

const EXAMPLES = "chart-examples.tsx";
const DOCS = "components/docs/profit-loss-line-demo.tsx";

/** All-positive P&L (props-table check: y-domain anchors at zero). */
const allPositiveData = profitLossLineDocsData.map((row, index) => ({
  date: row.date,
  [PROFIT_LOSS_DATA_KEY]:
    Math.abs(row[PROFIT_LOSS_DATA_KEY] as number) + index * 10,
}));

function pnlOf(point: Record<string, unknown>): number {
  return (point[PROFIT_LOSS_DATA_KEY] as number) ?? 0;
}

function pnlTooltip() {
  return (
    <ChartTooltip
      indicatorColor={(point) => profitLossColor(pnlOf(point))}
      rows={(point) => {
        const value = pnlOf(point);
        return [
          {
            color: profitLossColor(value),
            label: resolveProfitLossTooltipLabel(""),
            value,
          },
        ];
      }}
    />
  );
}

/**
 * Hidden series so the chart registers `pnl` for the y-domain and tooltip.
 * A plain function (not a component): LineChart finds `Line` children by type.
 */
function hiddenPnl(linear?: boolean) {
  return linear ? (
    <Line
      curve={curveLinear}
      dataKey={PROFIT_LOSS_DATA_KEY}
      fadeEdges={false}
      showHighlight={false}
      stroke="transparent"
      strokeWidth={0}
    />
  ) : (
    <Line
      dataKey={PROFIT_LOSS_DATA_KEY}
      showHighlight={false}
      stroke="transparent"
      strokeWidth={0}
    />
  );
}
/**
 * chart-examples `ProfitLossLineExample` / docs `ProfitLossLineDemo`: legend
 * hover state either live (`null` start) or pinned to a legend item.
 */
function ProfitLossWithLegend({
  margin,
  pinnedIndex,
}: {
  margin?: Partial<typeof EXAMPLE_MARGIN>;
  pinnedIndex?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const legendHoveredIndex = pinnedIndex ?? hovered;
  return (
    <div className="flex w-full flex-col gap-2">
      <LineChart data={profitLossLineDocsData} margin={margin}>
        <Grid
          highlightRowStroke="var(--foreground)"
          highlightRowStrokeOpacity={0.35}
          highlightRowValues={[0]}
          horizontal
        />
        {hiddenPnl(true)}
        <ProfitLossLegendHoverProvider hoveredIndex={legendHoveredIndex}>
          <ProfitLossLine dataKey={PROFIT_LOSS_DATA_KEY} />
        </ProfitLossLegendHoverProvider>
        <XAxis />
        {pnlTooltip()}
      </LineChart>
      <ProfitLossLegend
        align="center"
        hoveredIndex={legendHoveredIndex}
        onHoverChange={setHovered}
      />
    </div>
  );
}

function GalleryPnl({ children }: { children: ReactNode }) {
  return (
    <LineChart data={profitLossLineDocsData} margin={EXAMPLE_MARGIN}>
      {children}
      {hiddenPnl()}
      <ProfitLossLine dataKey={PROFIT_LOSS_DATA_KEY} />
      <XAxis />
      {pnlTooltip()}
    </LineChart>
  );
}

export const PROFIT_LOSS_VARIANTS: readonly LabVariant[] = [
  {
    kind: "single",
    id: "default",
    label: "Profit/Loss + legend",
    source: `${EXAMPLES}: makeProfitLossLineExamples "Profit/Loss Line" (ProfitLossLineExampleWithState); same as makeLineExamples "Line Chart - Profit/Loss"`,
    exercises:
      "sign-split ProfitLossLine segments, zero-crossing y-domain, Grid highlightRowValues [0], hidden linear Line, sign-coloured tooltip, centered ProfitLossLegend",
    height: 400,
    render: () => <ProfitLossWithLegend margin={EXAMPLE_MARGIN} />,
  },
  {
    kind: "single",
    id: "legend-profit",
    label: "Legend hover: Profit",
    source: `${EXAMPLES}: "Profit/Loss Line" with the legend's Profit item hovered (fixed state)`,
    exercises:
      "ProfitLossLegendHoverProvider hoveredIndex 0 dims loss segments",
    height: 400,
    render: () => (
      <ProfitLossWithLegend margin={EXAMPLE_MARGIN} pinnedIndex={0} />
    ),
  },
  {
    kind: "single",
    id: "legend-loss",
    label: "Legend hover: Loss",
    source: `${EXAMPLES}: "Profit/Loss Line" with the legend's Loss item hovered (fixed state)`,
    exercises:
      "ProfitLossLegendHoverProvider hoveredIndex 1 dims profit segments",
    height: 400,
    render: () => (
      <ProfitLossWithLegend margin={EXAMPLE_MARGIN} pinnedIndex={1} />
    ),
  },
  {
    kind: "single",
    id: "docs",
    label: "Docs preview",
    source: `${DOCS} ProfitLossLineDemo (profit-loss-line.mdx)`,
    exercises: "same composition with default LineChart margins (40)",
    height: 400,
    render: () => <ProfitLossWithLegend />,
  },
  {
    kind: "single",
    id: "left-y-axis",
    label: "Left Y axis",
    source: `${EXAMPLES}: "Profit/Loss Line - Left Y axis"`,
    exercises: "YAxis over a negative→positive domain, margin 40/40/40/56",
    render: () => (
      <LineChart
        data={profitLossLineDocsData}
        margin={{ top: 40, right: 40, bottom: 40, left: 56 }}
      >
        <Grid highlightRowValues={[0]} horizontal />
        {hiddenPnl()}
        <ProfitLossLine dataKey={PROFIT_LOSS_DATA_KEY} />
        <YAxis yAxisId="left" />
        <XAxis />
        {pnlTooltip()}
      </LineChart>
    ),
  },
  {
    kind: "single",
    id: "pattern-background",
    label: "Pattern background",
    source: `${EXAMPLES}: "Profit/Loss Line - Pattern Background"`,
    exercises: "Background diagonal behind the sign-split line",
    render: () => (
      <GalleryPnl>
        <Background />
      </GalleryPnl>
    ),
  },
  {
    kind: "single",
    id: "dot-background",
    label: "Dot grid background",
    source: `${EXAMPLES}: "Profit/Loss Line - Dot Grid Background"`,
    exercises: 'Background pattern="dots" opacity 0.85',
    render: () => (
      <GalleryPnl>
        <Background opacity={0.85} pattern="dots" />
      </GalleryPnl>
    ),
  },
  {
    kind: "single",
    id: "reference-band",
    label: "Reference band ±200",
    source: `${EXAMPLES}: "Profit/Loss Line - Reference Band" (y1 -200, y2 200)`,
    exercises: "ReferenceArea straddling zero, dashed + markers",
    render: () => (
      <GalleryPnl>
        <ReferenceArea showMarkers strokeStyle="dashed" y1={-200} y2={200} />
      </GalleryPnl>
    ),
  },
  {
    kind: "single",
    id: "pattern-reference-band",
    label: "Pattern reference band ±200",
    source: `${EXAMPLES}: "Profit/Loss Line - Pattern Reference Band"`,
    exercises: "ReferenceArea pattern fill + coloured axis labels across zero",
    render: () => (
      <GalleryPnl>
        <ReferenceArea
          axisLabelColor="var(--chart-1)"
          fillOpacity={0.85}
          pattern="diagonal"
          patternColor="var(--chart-foreground-muted)"
          y1={-200}
          y2={200}
        />
      </GalleryPnl>
    ),
  },
  {
    kind: "single",
    id: "custom-props",
    label: "Curve, fade, colours",
    source: "profit-loss-line.mdx ProfitLossLine props table",
    exercises:
      "ProfitLossLine curve={curveMonotoneX}, fadeEdges, strokeWidth 1.5, positiveColor / negativeColor",
    render: () => (
      <LineChart data={profitLossLineDocsData} margin={EXAMPLE_MARGIN}>
        <Grid highlightRowValues={[0]} horizontal />
        {hiddenPnl()}
        <ProfitLossLine
          curve={curveMonotoneX}
          dataKey={PROFIT_LOSS_DATA_KEY}
          fadeEdges
          negativeColor="var(--chart-4)"
          positiveColor="var(--chart-2)"
          strokeWidth={1.5}
        />
        <XAxis />
        {pnlTooltip()}
      </LineChart>
    ),
  },
  {
    kind: "single",
    id: "all-positive",
    label: "All positive (zero-anchored)",
    source:
      'line-chart.mdx "Profit/Loss line" (y-domain anchors at zero unless a value is negative)',
    exercises:
      "no zero crossing: y-domain anchored at 0, single profit colour, YAxis",
    render: () => (
      <LineChart
        data={allPositiveData}
        margin={{ ...EXAMPLE_MARGIN, left: 56 }}
      >
        <Grid highlightRowValues={[0]} horizontal />
        {hiddenPnl()}
        <ProfitLossLine dataKey={PROFIT_LOSS_DATA_KEY} />
        <YAxis />
        <XAxis />
        {pnlTooltip()}
      </LineChart>
    ),
  },
];
