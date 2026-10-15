"use client";

import type { ReactNode } from "react";
import { ChartExampleFrame } from "@/components/charts/chart-example-frame";
import {
  ChartExamplePreviewFrame,
  type ChartExamplePreviewLayout,
  getChartExampleContentPaddingClassName,
} from "@/components/charts/chart-example-preview";

export function FeaturedChartHero({
  title,
  description,
  code,
  data,
  footer = "Trending up by 5.2% this month",
  previewLayout = "cartesian",
  children,
}: {
  title: string;
  description: string;
  code: string;
  data?: string;
  footer?: string;
  previewLayout?: ChartExamplePreviewLayout;
  children: ReactNode;
}) {
  return (
    <ChartExampleFrame
      code={code}
      data={data}
      description={description}
      footer={footer}
      hero
      panelClassName={getChartExampleContentPaddingClassName(previewLayout)}
      title={title}
    >
      <ChartExamplePreviewFrame layout={previewLayout} previewRole="hero">
        {children}
      </ChartExamplePreviewFrame>
    </ChartExampleFrame>
  );
}
