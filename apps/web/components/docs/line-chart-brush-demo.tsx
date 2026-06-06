"use client";

import {
  ChartBrush,
  ChartBrushLayout,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
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

export function LineChartBrushDemo() {
  return (
    <div className="w-full" style={{ height: 360 }}>
      <ChartBrushLayout
        brushStrip={(brushLayout) => (
          <LineChart
            animationDuration={0}
            className="size-full"
            data={brushData}
            margin={brushStripMargin}
            status="ready"
            style={{ aspectRatio: "unset", height: "100%" }}
          >
            <Line
              animate={false}
              dataKey={DATA_KEY}
              fadeEdges
              showHighlight={false}
              stroke="var(--chart-line-primary)"
              strokeWidth={2}
            />
            <ChartBrush
              initialSelection={brushLayout.brushSelection ?? undefined}
              onSelectionChange={brushLayout.onBrushSelectionChange}
              selectionPattern={{
                color: "var(--chart-1)",
                preset: "diagonal",
              }}
            />
          </LineChart>
        )}
        data={brushData}
        enabled
        height={72}
      >
        {(brushLayout) => (
          <LineChart
            className="size-full"
            data={brushData}
            style={{ aspectRatio: "unset", height: "100%" }}
            tweenYDomainOnXDomainChange
            xDomain={brushLayout.xDomain}
            xDomainSlotCount={brushLayout.xDomainSlotCount}
            yDomainTween
          >
            <Grid horizontal stroke="var(--chart-grid)" />
            <Line
              dataKey={DATA_KEY}
              fadeEdges
              stroke="var(--chart-line-primary)"
              strokeWidth={2}
            />
            <XAxis />
            <ChartTooltip />
          </LineChart>
        )}
      </ChartBrushLayout>
    </div>
  );
}
