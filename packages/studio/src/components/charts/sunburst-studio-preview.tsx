"use client";

import {
  buildArcs,
  SunburstCenter,
  SunburstChart,
  SunburstLabels,
  SunburstSegment,
  sunburstCssVars,
  useChartLegendHover,
} from "@bklitui/ui/charts";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  StudioRadialCenter,
  studioSunburstSize,
} from "@/components/charts/studio-chart-layout";
import { StudioChartShell } from "@/components/charts/studio-chart-shell";
import {
  getStudioMotionEnterProps,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import { getSunburstData } from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import { useStudioChartContentFrame } from "@/lib/studio-chart-content-frame";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import { studioSunburstLegendItems } from "@/lib/studio-legend-items";
import type { StudioUrlState } from "@/lib/studio-parsers";
import {
  studioPreviewColorState,
  studioPreviewMotionState,
} from "@/lib/studio-preview-state";
import {
  getEffectiveSeriesColor,
  getSeriesFillMode,
  parseSeriesPatterns,
} from "@/lib/studio-series-design";
import { studioSunburstPatternDefs } from "@/lib/sunburst-patterns";

interface SunburstChartGeometry {
  pieSize: number;
  hoverPop: number;
  showLabels: boolean;
  labelFontSize: number;
  labelColor: string;
  labelOutlineColor: string;
  labelOutlineWidth: number;
  showCenter: boolean;
}

const SunburstChartBody = memo(
  function SunburstChartBody({
    geometry,
    geometryScrubbing,
    chartKey,
    chartSize,
    data,
    motionEnter,
    visibilityState,
    patternFillState,
    ctx,
    focusId,
    onFocusChange,
    legendArcIndices,
  }: {
    geometry: SunburstChartGeometry;
    geometryScrubbing: boolean;
    chartKey: string;
    chartSize: number;
    data: ReturnType<typeof getSunburstData>;
    motionEnter: ReturnType<typeof getStudioMotionEnterProps>;
    visibilityState: StudioUrlState;
    patternFillState: StudioUrlState;
    ctx: StudioRenderContext;
    focusId: string;
    onFocusChange: (id: string) => void;
    legendArcIndices: number[];
  }) {
    const {
      hoveredIndex: legendHoveredIndex,
      setHoveredIndex: setLegendHoveredIndex,
    } = useChartLegendHover();
    const [arcHoveredIndex, setArcHoveredIndex] = useState<number | null>(null);
    const { arcs } = useMemo(() => buildArcs(data), [data]);

    const legendIndexByArc = useMemo(() => {
      const map = new Map<number, number>();
      for (const [legendIndex, arcIndex] of legendArcIndices.entries()) {
        map.set(arcIndex, legendIndex);
      }
      return map;
    }, [legendArcIndices]);

    // Legend panel → chart (focus children only)
    useEffect(() => {
      if (legendHoveredIndex != null) {
        const arcIndex = legendArcIndices[legendHoveredIndex];
        if (arcIndex != null) {
          setArcHoveredIndex(arcIndex);
        }
        return;
      }
      setArcHoveredIndex((current) =>
        current != null && legendIndexByArc.has(current) ? null : current
      );
    }, [legendArcIndices, legendHoveredIndex, legendIndexByArc]);

    const handleArcHoverChange = useCallback(
      (arcIndex: number | null) => {
        setArcHoveredIndex(arcIndex);
        if (arcIndex == null) {
          setLegendHoveredIndex(null);
          return;
        }
        setLegendHoveredIndex(legendIndexByArc.get(arcIndex) ?? null);
      },
      [legendIndexByArc, setLegendHoveredIndex]
    );

    // biome-ignore lint/correctness/useExhaustiveDependencies: clear hover when drill focus changes
    useEffect(() => {
      setArcHoveredIndex(null);
      setLegendHoveredIndex(null);
    }, [focusId, setLegendHoveredIndex]);

    const seriesPatterns = useMemo(
      () => parseSeriesPatterns(patternFillState),
      [patternFillState]
    );

    const patternArcs = useMemo(
      () =>
        arcs.filter(
          (_, arcIndex) =>
            getSeriesFillMode(patternFillState, arcIndex) === "pattern"
        ),
      [arcs, patternFillState]
    );

    const segments = useMemo(() => {
      if (geometryScrubbing) {
        return null;
      }
      return arcs.map((arc) => {
        if (
          !isStudioComponentVisible(
            visibilityState,
            `sunburst.segment.${arc.arcIndex}`
          )
        ) {
          return null;
        }
        const patternFill = ctx.patternFillAt(arc.arcIndex);
        const fill =
          getSeriesFillMode(patternFillState, arc.arcIndex) === "pattern" &&
          patternFill
            ? patternFill
            : undefined;
        const color = getEffectiveSeriesColor(
          patternFillState,
          arc.categoryIndex
        );

        return (
          <SunburstSegment
            color={color}
            fill={fill}
            index={arc.arcIndex}
            key={arc.id}
          />
        );
      });
    }, [
      arcs,
      ctx.patternFillAt,
      geometryScrubbing,
      patternFillState,
      visibilityState,
    ]);

    const labelFill = geometry.labelColor.trim() || sunburstCssVars.label;
    const labelStroke =
      geometry.labelOutlineColor.trim() || sunburstCssVars.background;

    return (
      <StudioRadialCenter frame={{ width: chartSize, height: chartSize }}>
        <SunburstChart
          className="mx-auto"
          data={data}
          enterStaggerScale={motionEnter.enterStaggerScale}
          enterTransition={motionEnter.enterTransition}
          focusId={focusId}
          hoveredIndex={arcHoveredIndex}
          hoverPop={geometry.hoverPop}
          key={chartKey}
          onFocusChange={onFocusChange}
          onHoverChange={handleArcHoverChange}
          size={chartSize}
        >
          {patternArcs.length > 0
            ? studioSunburstPatternDefs(arcs, seriesPatterns)
            : null}
          {segments}
          {geometry.showCenter ? <SunburstCenter /> : null}
          {geometry.showLabels ? (
            <SunburstLabels
              fill={labelFill}
              fontSize={geometry.labelFontSize}
              stroke={labelStroke}
              strokeWidth={geometry.labelOutlineWidth}
            />
          ) : null}
        </SunburstChart>
      </StudioRadialCenter>
    );
  },
  (prev, next) =>
    prev.geometry === next.geometry &&
    prev.geometryScrubbing === next.geometryScrubbing &&
    prev.chartKey === next.chartKey &&
    prev.chartSize === next.chartSize &&
    prev.data === next.data &&
    prev.motionEnter === next.motionEnter &&
    prev.visibilityState === next.visibilityState &&
    prev.patternFillState === next.patternFillState &&
    prev.ctx === next.ctx &&
    prev.focusId === next.focusId &&
    prev.legendArcIndices === next.legendArcIndices
);

export const SunburstStudioPreview = memo(function SunburstStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const contentFrame = useStudioChartContentFrame(ctx.frame);
  const data = useMemo(() => getSunburstData(ctx.dataSeed), [ctx.dataSeed]);
  const { rootId } = useMemo(() => buildArcs(data), [data]);
  const [focusId, setFocusId] = useState(rootId);

  useEffect(() => {
    setFocusId(rootId);
  }, [rootId]);

  const motionState = studioPreviewMotionState(state, ctx);
  const colorState = studioPreviewColorState(state, ctx);

  const geometry = useMemo(
    (): SunburstChartGeometry => ({
      pieSize: state.pieSize,
      hoverPop: state.pieHoverOffset,
      showLabels:
        state.sunburstShowLabels &&
        isStudioComponentVisible(ctx.chromeState, "sunburst.labels"),
      labelFontSize: state.sunburstLabelFontSize,
      labelColor: state.sunburstLabelColor,
      labelOutlineColor: state.sunburstLabelOutlineColor,
      labelOutlineWidth: state.sunburstLabelOutlineWidth,
      showCenter: true,
    }),
    [
      state.pieSize,
      state.pieHoverOffset,
      state.sunburstShowLabels,
      state.sunburstLabelFontSize,
      state.sunburstLabelColor,
      state.sunburstLabelOutlineColor,
      state.sunburstLabelOutlineWidth,
      ctx.chromeState,
    ]
  );

  const chartSize = studioSunburstSize(contentFrame, geometry.pieSize);

  const motionEnter = useMemo(
    () =>
      getStudioMotionEnterProps(motionState, {
        linear: ctx.isRecording,
      }),
    [ctx.isRecording, motionState]
  );

  const legendResult = useMemo(
    () => studioSunburstLegendItems(ctx.chromeState, focusId, ctx.dataSeed),
    [ctx.chromeState, ctx.dataSeed, focusId]
  );

  return (
    <StudioChartShell
      legendComponentId="sunburst.legend"
      legendItems={legendResult.items}
      state={ctx.chromeState}
    >
      <SunburstChartBody
        chartKey={studioPreviewChartKey(ctx)}
        chartSize={chartSize}
        ctx={ctx}
        data={data}
        focusId={focusId}
        geometry={geometry}
        geometryScrubbing={ctx.numberScrubbing}
        legendArcIndices={legendResult.arcIndices}
        motionEnter={motionEnter}
        onFocusChange={setFocusId}
        patternFillState={colorState}
        visibilityState={ctx.chromeState}
      />
    </StudioChartShell>
  );
});
