"use client";

import {
  AreaSparkline,
  BarSparkline,
  LineSparkline,
  type SparklineCrosshair,
  useSparklineHover,
} from "@bklitui/ui/charts";
import { memo, useMemo } from "react";
import {
  getStudioCssRevealPropsForPreview,
  studioPreviewChartKey,
} from "@/lib/chart-animation";
import {
  getSparklineKpiData,
  type SparklineDemoKpi,
  type SparklineDemoPoint,
} from "@/lib/demo-data";
import type { StudioRenderContext } from "@/lib/render-context";
import { isStudioComponentVisible } from "@/lib/studio-component-visibility";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { studioPreviewColorState } from "@/lib/studio-preview-state";
import { getEffectiveSeriesColor } from "@/lib/studio-series-design";

const HERO_SPARKLINE_MIN_HEIGHT = 32;
const HERO_SPARKLINE_MAX_HEIGHT = 140;
const NARROW_FRAME_WIDTH = 520;
/** Card chrome around the sparkline: padding + border + label + value + gaps. */
const CARD_CHROME_PX = 70;
const HERO_CHROME_PX = 74;
/** Body padding (p-3 × 2) + gap between hero and grid. */
const BODY_CHROME_PX = 32;
const GRID_GAP_PX = 8;

/** Hero sparkline fills whatever height the card grid leaves in the frame. */
function heroSparklineHeight(
  frameHeight: number,
  cardHeight: number,
  rows: number
): number {
  const gridHeight =
    rows * (CARD_CHROME_PX + cardHeight) + (rows - 1) * GRID_GAP_PX;
  const remaining = frameHeight - BODY_CHROME_PX - gridHeight - HERO_CHROME_PX;
  return Math.min(
    HERO_SPARKLINE_MAX_HEIGHT,
    Math.max(HERO_SPARKLINE_MIN_HEIGHT, Math.floor(remaining))
  );
}

/** Everything the sparkline itself needs — primitives only so memo is cheap. */
interface SparklineVisual {
  variant: StudioUrlState["sparklineVariant"];
  color: string;
  curve: StudioUrlState["sparklineCurve"];
  strokeWidth: number;
  fill: StudioUrlState["sparklineFill"];
  fillOpacity: number;
  barGap: number;
  barRadius: number;
  inactiveOpacity: number;
  hoverTransition: boolean;
  springDamping: number;
  crosshair: SparklineCrosshair;
  dot: boolean;
  endDot: boolean;
  animate: boolean;
  animationDuration: number;
  animationEasing: string;
}

const valueKey = "value" as const;

interface SparklineHoverProps {
  hoverIndex: number | null;
  onHoverChange: (
    index: number | null,
    datum: SparklineDemoPoint | null
  ) => void;
}

function StudioSparkline({
  data,
  height,
  visual,
  hoverProps,
}: {
  data: SparklineDemoPoint[];
  height: number;
  visual: SparklineVisual;
  hoverProps: SparklineHoverProps;
}) {
  const shared = {
    data,
    dataKey: valueKey,
    height,
    color: visual.color,
    crosshair: visual.crosshair,
    dot: visual.dot,
    hoverTransition: visual.hoverTransition,
    springConfig: { damping: visual.springDamping },
    animate: visual.animate,
    animationDuration: visual.animationDuration,
    animationEasing: visual.animationEasing,
    ...hoverProps,
  };
  if (visual.variant === "bar") {
    return (
      <BarSparkline
        {...shared}
        barGap={visual.barGap}
        barRadius={visual.barRadius}
        inactiveOpacity={visual.inactiveOpacity}
      />
    );
  }
  if (visual.variant === "area") {
    return (
      <AreaSparkline
        {...shared}
        curve={visual.curve}
        endDot={visual.endDot}
        fill={visual.fill}
        fillOpacity={visual.fillOpacity}
        strokeWidth={visual.strokeWidth}
      />
    );
  }
  return (
    <LineSparkline
      {...shared}
      curve={visual.curve}
      endDot={visual.endDot}
      strokeWidth={visual.strokeWidth}
    />
  );
}

const SparklineKpiCard = memo(function SparklineKpiCard({
  kpi,
  visual,
  height,
  hero = false,
  showSeries,
}: {
  kpi: SparklineDemoKpi;
  visual: SparklineVisual;
  height: number;
  hero?: boolean;
  showSeries: boolean;
}) {
  const hover = useSparklineHover<SparklineDemoPoint>();
  const formatter = useMemo(
    () => new Intl.NumberFormat("en-US", kpi.format),
    [kpi.format]
  );
  const first = kpi.data[0]?.value ?? 0;
  const latest = kpi.data.at(-1)?.value ?? 0;
  const shown = hover.datum?.value ?? latest;
  const change = first === 0 ? 0 : (shown - first) / Math.abs(first);
  const changeLabel = `${change >= 0 ? "+" : ""}${(change * 100).toFixed(1)}%`;

  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-border/60 bg-background/60 p-2.5">
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <span className="truncate text-muted-foreground text-xs">
          {kpi.label}
        </span>
        <span
          className={
            change >= 0
              ? "text-emerald-600 text-xs tabular-nums dark:text-emerald-400"
              : "text-red-600 text-xs tabular-nums dark:text-red-400"
          }
        >
          {changeLabel}
        </span>
      </div>
      <span
        className={
          hero
            ? "font-semibold text-foreground text-xl tabular-nums tracking-tight"
            : "font-semibold text-base text-foreground tabular-nums tracking-tight"
        }
      >
        {formatter.format(shown)}
      </span>
      {showSeries ? (
        <StudioSparkline
          data={kpi.data}
          height={height}
          hoverProps={hover.sparklineProps}
          visual={visual}
        />
      ) : (
        <div style={{ height }} />
      )}
    </div>
  );
});

const SparklineStudioBody = memo(function SparklineStudioBody({
  kpis,
  visual,
  cardHeight,
  heroHeight,
  columns,
  showSeries,
}: {
  kpis: SparklineDemoKpi[];
  visual: SparklineVisual;
  cardHeight: number;
  heroHeight: number;
  columns: number;
  showSeries: boolean;
}) {
  const [hero, ...cards] = kpis;
  return (
    <div className="justify-center-safe flex size-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden p-3">
      {hero ? (
        <SparklineKpiCard
          height={heroHeight}
          hero
          kpi={hero}
          showSeries={showSeries}
          visual={visual}
        />
      ) : null}
      <div
        className="grid min-w-0 gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {cards.map((kpi) => (
          <SparklineKpiCard
            height={cardHeight}
            key={kpi.id}
            kpi={kpi}
            showSeries={showSeries}
            visual={visual}
          />
        ))}
      </div>
    </div>
  );
});

export const SparklineStudioPreview = memo(function SparklineStudioPreview({
  state,
  ctx,
}: {
  state: StudioUrlState;
  ctx: StudioRenderContext;
}) {
  const chartKey = studioPreviewChartKey(ctx);
  const colorState = studioPreviewColorState(state, ctx);
  const color = getEffectiveSeriesColor(colorState, 0);
  const { animationDuration, animationEasing } =
    getStudioCssRevealPropsForPreview(state, ctx);

  const showSeries = isStudioComponentVisible(state, "sparkline.series");
  const showCrosshair = isStudioComponentVisible(state, "sparkline.crosshair");
  const showDot = isStudioComponentVisible(state, "sparkline.dot");

  const visual = useMemo(
    (): SparklineVisual => ({
      variant: state.sparklineVariant,
      color,
      curve: state.sparklineCurve,
      strokeWidth: state.sparklineStrokeWidth,
      fill: state.sparklineFill,
      fillOpacity: state.sparklineFillOpacity,
      barGap: state.sparklineBarGap,
      barRadius: state.sparklineBarRadius,
      inactiveOpacity: state.sparklineInactiveOpacity,
      crosshair: showCrosshair ? state.sparklineCrosshair : false,
      dot: showDot,
      hoverTransition: state.sparklineHoverSpring,
      springDamping: state.sparklineSpringDamping,
      endDot: state.sparklineEndDot,
      animate: state.sparklineAnimate,
      animationDuration,
      animationEasing,
    }),
    [
      state.sparklineVariant,
      color,
      state.sparklineCurve,
      state.sparklineStrokeWidth,
      state.sparklineFill,
      state.sparklineFillOpacity,
      state.sparklineBarGap,
      state.sparklineBarRadius,
      state.sparklineInactiveOpacity,
      showCrosshair,
      state.sparklineCrosshair,
      showDot,
      state.sparklineHoverSpring,
      state.sparklineSpringDamping,
      state.sparklineEndDot,
      state.sparklineAnimate,
      animationDuration,
      animationEasing,
    ]
  );

  const kpis = useMemo(
    () => getSparklineKpiData(state.sparklinePoints, ctx.dataSeed),
    [state.sparklinePoints, ctx.dataSeed]
  );

  const cardHeight = state.sparklineHeight;
  const columns = ctx.frame.width < NARROW_FRAME_WIDTH ? 2 : 3;
  const rows = Math.ceil(Math.max(0, kpis.length - 1) / columns);
  const heroHeight = heroSparklineHeight(ctx.frame.height, cardHeight, rows);

  return (
    <SparklineStudioBody
      cardHeight={cardHeight}
      columns={columns}
      heroHeight={heroHeight}
      key={chartKey}
      kpis={kpis}
      showSeries={showSeries}
      visual={visual}
    />
  );
});
