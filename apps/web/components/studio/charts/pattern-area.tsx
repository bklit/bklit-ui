"use client";

import { useChart } from "@bklitui/ui/charts";
import type { curveMonotoneX } from "@visx/curve";
import { AreaClosed } from "@visx/shape";

export function StudioPatternArea({
  dataKey,
  fill,
  curve,
}: {
  dataKey: string;
  fill: string;
  curve?: typeof curveMonotoneX;
}) {
  const { data, xScale, yScale, xAccessor } = useChart();

  return (
    <AreaClosed
      curve={curve}
      data={data}
      fill={fill}
      x={(d) => xScale(xAccessor(d)) ?? 0}
      y={(d) => {
        const v = d[dataKey];
        return typeof v === "number" ? (yScale(v) ?? 0) : 0;
      }}
      yScale={yScale}
    />
  );
}
