"use client";

import type { ReactNode } from "react";
import { ChartExampleFrame } from "@/components/charts/chart-example-frame";
import type { ChartExamplePreviewLayout } from "@/components/charts/chart-example-preview";

export function FeaturedChartHero({
  anchorId,
  chartSlug,
  title,
  description,
  code,
  data,
  footer = "Trending up by 5.2% this month",
  previewLayout = "cartesian",
  children,
}: {
  anchorId?: string;
  chartSlug: string;
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
      anchorId={anchorId}
      chartSlug={chartSlug}
      code={code}
      data={data}
      description={description}
      footer={footer}
      hero
      previewLayout={previewLayout}
      title={title}
    >
      {children}
    </ChartExampleFrame>
  );
}
