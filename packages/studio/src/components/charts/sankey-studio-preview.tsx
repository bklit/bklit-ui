"use client";

import {
  SankeyChart,
  SankeyLink,
  SankeyNode,
  SankeyTooltip,
  useChartLegendHover,
} from "@bklitui/ui/charts";
import { memo, useMemo } from "react";
import { StudioCartesianFill } from "@/components/charts/studio-chart-layout";
import { StudioChartShell } from "@/components/charts/studio-chart-shell";
import {
  getStudioCssRevealPropsForPreview,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { getSankeyData } from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import { studioSankeyLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";

const SankeyChartBody = memo(function SankeyChartBody({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const { hoveredIndex, setHoveredIndex } = useChartLegendHover();

  return (
    <StudioCartesianFill>
      <SankeyChart
        {...getStudioCssRevealPropsForPreview(state, ctx)}
        className="size-full"
        data={getSankeyData(ctx.dataSeed)}
        hoveredNodeIndex={hoveredIndex}
        key={studioPreviewChartKey(ctx)}
        nodePadding={state.sankeyNodePadding}
        nodeWidth={state.sankeyNodeWidth}
        onNodeHoverChange={setHoveredIndex}
      >
        <SankeyNode key="nodes" />
        <SankeyLink key="links" strokeOpacity={state.linkOpacity} />
        <SankeyTooltip key="tooltip" />
      </SankeyChart>
    </StudioCartesianFill>
  );
});

export function SankeyStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const legendItems = useMemo(
    () => studioSankeyLegendItems(state, ctx.dataSeed),
    [ctx.dataSeed, state]
  );

  return (
    <StudioChartShell
      legendComponentId="sankey.legend"
      legendItems={legendItems}
      state={state}
    >
      <SankeyChartBody ctx={ctx} state={state} />
    </StudioChartShell>
  );
}
