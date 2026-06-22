"use client";

import {
  SankeyChart,
  SankeyLink,
  SankeyNode,
  SankeyTooltip,
  useChartLegendHover,
  useStaticChartPreview,
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

function studioSankeyMargin(frameWidth: number) {
  if (frameWidth >= 640) {
    return undefined;
  }

  // Reserve space for single-letter names beside outer columns (~22% per side).
  const side = Math.max(56, Math.min(88, Math.round(frameWidth * 0.2)));

  return {
    top: 16,
    right: side,
    bottom: 24,
    left: side,
  };
}

function studioSankeyAspectRatio(frameWidth: number) {
  return frameWidth < 520 ? ("4 / 3" as const) : ("2 / 1" as const);
}

function studioSankeyCompact(frameWidth: number) {
  return frameWidth < 520;
}

const SankeyChartBody = memo(function SankeyChartBody({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const { hoveredIndex, setHoveredIndex } = useChartLegendHover();
  const isStaticPreview = useStaticChartPreview();
  const compact = studioSankeyCompact(ctx.frame.width);
  const margin = useMemo(
    () => studioSankeyMargin(ctx.frame.width),
    [ctx.frame.width]
  );
  const aspectRatio = useMemo(
    () => studioSankeyAspectRatio(ctx.frame.width),
    [ctx.frame.width]
  );
  const showValueLabels = !(isStaticPreview && compact);

  return (
    <StudioCartesianFill>
      <SankeyChart
        {...getStudioCssRevealPropsForPreview(state, ctx)}
        aspectRatio={aspectRatio}
        className="size-full"
        data={getSankeyData(ctx.dataSeed)}
        hoveredNodeIndex={hoveredIndex}
        key={studioPreviewChartKey(ctx)}
        margin={margin}
        nodePadding={state.sankeyNodePadding}
        nodeWidth={state.sankeyNodeWidth}
        onNodeHoverChange={setHoveredIndex}
      >
        <SankeyNode key="nodes" showValueLabels={showValueLabels} />
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
      state={ctx.chromeState}
    >
      <SankeyChartBody ctx={ctx} state={state} />
    </StudioChartShell>
  );
}
