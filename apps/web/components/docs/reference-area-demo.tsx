"use client";

import {
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  ReferenceArea,
  XAxis,
} from "@bklitui/ui/charts";
import {
  buildLineChartDemoData,
  REFERENCE_AREA_DEMO,
} from "@/components/docs/line-chart-demo-data";

const chartData = buildLineChartDemoData();

export function ReferenceAreaBandDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <ReferenceArea
          showMarkers
          strokeStyle="dashed"
          y1={REFERENCE_AREA_DEMO.y1}
          y2={REFERENCE_AREA_DEMO.y2}
        />
        <Line dataKey="value" strokeWidth={2} />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function ReferenceAreaPatternDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <ReferenceArea
          axisLabelColor={REFERENCE_AREA_DEMO.axisLabelColor}
          pattern={REFERENCE_AREA_DEMO.pattern}
          patternColor={REFERENCE_AREA_DEMO.patternColor}
          patternScale={REFERENCE_AREA_DEMO.patternScale}
          patternStrokeWidth={REFERENCE_AREA_DEMO.patternStrokeWidth}
          showMarkers={REFERENCE_AREA_DEMO.showMarkers}
          stroke={REFERENCE_AREA_DEMO.stroke}
          y1={REFERENCE_AREA_DEMO.y1}
          y2={REFERENCE_AREA_DEMO.y2}
        />
        <Line dataKey="value" strokeWidth={2} />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}

export function ReferenceAreaMarkersDemo() {
  return (
    <div className="w-full">
      <LineChart data={chartData}>
        <Grid horizontal />
        <ReferenceArea
          markerColor="var(--chart-1)"
          showMarkers
          stroke="var(--chart-1)"
          strokeStyle="dashed"
          y1={REFERENCE_AREA_DEMO.y1}
          y2={REFERENCE_AREA_DEMO.y2}
        />
        <Line dataKey="value" strokeWidth={2} />
        <XAxis />
        <ChartTooltip />
      </LineChart>
    </div>
  );
}
