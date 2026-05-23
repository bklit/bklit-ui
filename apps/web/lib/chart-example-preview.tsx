"use client";

import type { Margin } from "@bklitui/ui/charts";
import type { ComponentType } from "react";
import { useChartExampleMargin } from "@/lib/chart-example-margin";

export function createChartExamplePreview<
  P extends { margin?: Partial<Margin> },
>(Chart: ComponentType<P>) {
  function ChartExamplePreview(props: P) {
    const { margin, ...rest } = props;
    const responsiveMargin = useChartExampleMargin();

    return (
      <Chart
        {...(rest as P)}
        margin={{ ...responsiveMargin, ...margin } as P["margin"]}
      />
    );
  }

  return ChartExamplePreview;
}
