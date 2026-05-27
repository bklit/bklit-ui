"use client"

// In your app (monorepo/npm): import from "@bklitui/ui/charts"
import {
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  ProfitLossLegend,
  ProfitLossLegendHoverProvider,
  ProfitLossLine,
  profitLossColor,
  resolveProfitLossTooltipLabel,
  XAxis,
} from "@/components/charts"
import { curveLinear } from "@visx/curve";
import { useState } from "react";

const chartData = [
  { date: new Date("2024-01-01"), pnl: 420 },
  { date: new Date("2024-01-05"), pnl: 180 },
  { date: new Date("2024-01-10"), pnl: -240 },
  { date: new Date("2024-01-15"), pnl: -90 },
  { date: new Date("2024-01-20"), pnl: 310 },
  { date: new Date("2024-01-25"), pnl: 520 },
];

export default function Component() {
  const [legendHoveredIndex, setLegendHoveredIndex] = useState<number | null>(
    null
  );

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-3xl flex-col gap-2">
        <ProfitLossLegend
          align="center"
          hoveredIndex={legendHoveredIndex}
          onHoverChange={setLegendHoveredIndex}
        />
        <LineChart data={chartData}>
          <Grid highlightRowValues={[0]} horizontal />
          <Line
            curve={curveLinear}
            dataKey="pnl"
            fadeEdges={false}
            showHighlight={false}
            stroke="transparent"
            strokeWidth={0}
          />
          <ProfitLossLegendHoverProvider hoveredIndex={legendHoveredIndex}>
            <ProfitLossLine dataKey="pnl" />
          </ProfitLossLegendHoverProvider>
          <XAxis />
          <ChartTooltip
            indicatorColor={(point) => profitLossColor((point.pnl as number) ?? 0)}
            rows={(point) => {
              const value = (point.pnl as number) ?? 0;
              return [
                {
                  color: profitLossColor(value),
                  label: resolveProfitLossTooltipLabel(""),
                  value,
                },
              ];
            }}
          />
        </LineChart>
      </div>
    </main>
  )
}
