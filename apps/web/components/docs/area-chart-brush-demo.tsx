"use client";

import {
  Area,
  AreaChart,
  ChartBrush,
  ChartBrushLayout,
  ChartTooltip,
  Grid,
  XAxis,
} from "@bklitui/ui/charts";

const DATA_KEY = "value";

const brushData = Array.from({ length: 30 }, (_, index) => {
  const date = new Date("2025-01-01");
  date.setDate(date.getDate() + index);
  return {
    date,
    [DATA_KEY]: Math.round(420 + Math.sin(index * 0.7) * 90 + index * 14),
  };
});

const brushStripMargin = { top: 4, right: 40, bottom: 4, left: 40 };

export function AreaChartBrushDemo() {
  return (
    <div className="w-full" style={{ height: 360 }}>
      <ChartBrushLayout
        brushStrip={(brushLayout) => (
          <AreaChart
            animationDuration={0}
            className="size-full"
            data={brushData}
            margin={brushStripMargin}
            status="ready"
            style={{ aspectRatio: "unset", height: "100%" }}
          >
            <Area
              animate={false}
              dataKey={DATA_KEY}
              fadeEdges
              fill="var(--chart-line-primary)"
              fillOpacity={0.15}
              showHighlight={false}
              strokeWidth={2}
            />
            <ChartBrush
              fadeOuterEdges
              initialSelection={brushLayout.brushSelection ?? undefined}
              onSelectionChange={brushLayout.onBrushSelectionChange}
              selectionPattern={{
                color: "color-mix(in oklch, var(--chart-1) 20%, transparent)",
                preset: "diagonal",
              }}
            />
          </AreaChart>
        )}
        data={brushData}
        enabled
        height={72}
      >
        {(brushLayout) => (
          <AreaChart
            className="size-full"
            data={brushData}
            style={{ aspectRatio: "unset", height: "100%" }}
            tweenYDomainOnXDomainChange
            xDomain={brushLayout.xDomain}
            xDomainSlotCount={brushLayout.xDomainSlotCount}
            yDomainTween
          >
            <Grid horizontal stroke="var(--chart-grid)" />
            <Area
              dataKey={DATA_KEY}
              fadeEdges
              fill="var(--chart-line-primary)"
              fillOpacity={0.35}
              strokeWidth={2}
            />
            <XAxis />
            <ChartTooltip />
          </AreaChart>
        )}
      </ChartBrushLayout>
    </div>
  );
}
