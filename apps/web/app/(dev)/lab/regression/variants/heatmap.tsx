"use client";

import {
  buildHeatmapRowOpacity,
  HEATMAP_DEFAULT_LEVEL_STYLES,
  HEATMAP_MONTHS_ONE_YEAR,
  HEATMAP_MONTHS_SIX,
  HEATMAP_WEEKS_ONE_YEAR,
  HeatmapCells,
  HeatmapChart,
  HeatmapChartLoading,
  type HeatmapColumn,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  type HeatmapLevelColors,
  type HeatmapLevelStyles,
  HeatmapSeparator,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapYAxis,
} from "@bklitui/ui/charts";
import { type ReactNode, useEffect, useState } from "react";
import { labHeatmapData } from "./heatmap-data";
import type { LabVariant } from "./types";

const EXAMPLES = "chart-examples.tsx";
const DOCS = "content/docs/components/heatmap-chart.mdx";
const RECIPES = "recipes/definitions/heatmaps.tsx";

const FRAME_WIDTH = 760;

// Same data the sources use (`getHeatmapDemoData()` / `(0, 6)`), ending on
// LAB_NOW instead of today.
const yearData = labHeatmapData();
const sixMonthData = labHeatmapData(0, HEATMAP_MONTHS_SIX);

// Constants copied verbatim from chart-examples.tsx.
const GAP = 3;
const CIRCULAR_CORNER_RADIUS = 999;
const SEPARATOR_SPACING = 20;
const SEPARATOR_START_OFFSET = -20;
const HERO_SEPARATOR_GRADIENT = {
  from: "var(--muted)",
  via: "var(--muted)",
  to: "var(--muted)",
  fromOpacity: 0,
  viaOpacity: 1,
  toOpacity: 0,
} as const;
const HERO_SEPARATOR_LABEL_CLASS = "text-[var(--chart-3)]";
const HERO_INACTIVE_OPACITY = 0.8;
const HERO_INACTIVE_SCALE = 0.8;
const SCROLL_VISIBLE_WEEKS = Math.round(
  (HEATMAP_WEEKS_ONE_YEAR / HEATMAP_MONTHS_ONE_YEAR) * HEATMAP_MONTHS_SIX
);
const GALLERY_MARGIN = { top: 28, right: 12, bottom: 0, left: 44 } as const;
const SCROLL_MARGIN = { top: 28, right: 12, bottom: 0, left: 0 } as const;
const SCROLL_Y_LABELS = [
  { row: 1, label: "Mon" },
  { row: 3, label: "Wed" },
  { row: 5, label: "Fri" },
] as const;

const patternLevelStyles = [
  HEATMAP_DEFAULT_LEVEL_STYLES[0],
  HEATMAP_DEFAULT_LEVEL_STYLES[1],
  {
    ...HEATMAP_DEFAULT_LEVEL_STYLES[2],
    fillMode: "pattern" as const,
    pattern: "diagonal" as const,
    patternColor: "var(--chart-scale-pattern-color)",
  },
  HEATMAP_DEFAULT_LEVEL_STYLES[3],
  HEATMAP_DEFAULT_LEVEL_STYLES[4],
] as const satisfies HeatmapLevelStyles;

const performanceLevelStyles = [
  { color: "#0e7490", fillMode: "solid" as const, pattern: "none" as const },
  { color: "#22d3ee", fillMode: "solid" as const, pattern: "none" as const },
  { color: "#bef264", fillMode: "solid" as const, pattern: "none" as const },
  { color: "#facc15", fillMode: "solid" as const, pattern: "none" as const },
  { color: "#f97316", fillMode: "solid" as const, pattern: "none" as const },
] as const satisfies HeatmapLevelStyles;

const WEEKEND_ROW_OPACITY = buildHeatmapRowOpacity((row) => row >= 5, 0.35);
const ACTIVE_SCALE_GAP = 4;
const ACTIVE_SCALE = 1.1;
const ACTIVE_SCALE_INACTIVE_OPACITY = 0.45;

const SEPARATOR_LABELS_WRAPPER_CLASS =
  "flex w-full max-w-full flex-col items-stretch gap-2 pt-5";
const WRAPPER_CLASS = "flex w-full max-w-full flex-col items-stretch gap-2";

// recipes/definitions/heatmaps.tsx: Dot calendar.
const RECIPE_SEPARATOR_FADE = {
  from: "var(--muted-foreground)",
  via: "var(--muted-foreground)",
  to: "var(--muted-foreground)",
  fromOpacity: 0,
  viaOpacity: 0.5,
  toOpacity: 0,
};

// Props-table extras (no ported example sets these).
const customLevelColors = [
  "var(--muted)",
  "#c7d2fe",
  "#818cf8",
  "#4f46e5",
  "#312e81",
] as const satisfies HeatmapLevelColors;

/** Delay before the loading → ready variant flips `status`. */
const LOADING_FLIP_MS = 1200;

function Shell({ children }: { children: ReactNode }) {
  return (
    <HeatmapInteractionProvider>
      <HeatmapInteractionBoundary>{children}</HeatmapInteractionBoundary>
    </HeatmapInteractionProvider>
  );
}

/** chart-examples.tsx `HeatmapGalleryExample`. */
function GalleryHeatmap({
  data = sixMonthData,
  levelStyles = HEATMAP_DEFAULT_LEVEL_STYLES,
  gap = GAP,
  cornerRadius = 2,
  inactiveOpacity,
  inactiveScale,
  activeScale,
}: {
  data?: HeatmapColumn[];
  levelStyles?: HeatmapLevelStyles;
  gap?: number;
  cornerRadius?: number;
  inactiveOpacity?: number;
  inactiveScale?: number;
  activeScale?: number;
}) {
  return (
    <Shell>
      <div className={WRAPPER_CLASS}>
        <HeatmapChart
          className="w-full min-w-0"
          data={data}
          gap={gap}
          layout="fluid"
          levelStyles={levelStyles}
          margin={GALLERY_MARGIN}
        >
          <HeatmapCells
            activeScale={activeScale}
            cornerRadius={cornerRadius}
            inactiveOpacity={inactiveOpacity}
            inactiveScale={inactiveScale}
          />
          <HeatmapXAxis />
          <HeatmapYAxis />
          <HeatmapTooltip />
        </HeatmapChart>
        <HeatmapLegend
          activeScale={activeScale}
          align="center"
          cornerRadius={cornerRadius}
          gap={gap}
          inactiveOpacity={inactiveOpacity}
          inactiveScale={inactiveScale}
          levelStyles={levelStyles}
        />
      </div>
    </Shell>
  );
}

/** chart-examples.tsx `HeatmapHorizontalScrollGalleryExample`, frozen at 0. */
function HorizontalScrollHeatmap() {
  // The source measures the scroll viewport with a ResizeObserver; the frame
  // is fixed, so its width is too (frame minus the y-label gutter).
  const viewportWidth = FRAME_WIDTH - GALLERY_MARGIN.left;
  const columnCount = yearData.length;
  const innerWidthRatio = columnCount / SCROLL_VISIBLE_WEEKS;
  const plotWidth =
    viewportWidth * (columnCount / SCROLL_VISIBLE_WEEKS) - SCROLL_MARGIN.right;
  const binSize = plotWidth / columnCount;

  return (
    <Shell>
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full min-w-0">
          <div
            className="relative shrink-0"
            style={{ width: GALLERY_MARGIN.left }}
          >
            {SCROLL_Y_LABELS.map((item) => (
              <div
                className="pointer-events-none absolute right-1 flex w-[calc(100%-4px)] items-center justify-end"
                key={item.label}
                style={{
                  top:
                    SCROLL_MARGIN.top +
                    item.row * binSize +
                    (binSize - GAP) / 2,
                  transform: "translateY(-50%)",
                }}
              >
                <span className="whitespace-nowrap text-chart-label text-xs">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <div className="scroll-fade-x no-scrollbar min-w-0 flex-1 overflow-x-auto overscroll-x-contain">
            <div style={{ width: `${innerWidthRatio * 100}%` }}>
              <HeatmapChart
                className="w-full"
                data={yearData}
                gap={GAP}
                layout="fluid"
                margin={SCROLL_MARGIN}
              >
                <HeatmapCells />
                <HeatmapXAxis />
                <HeatmapTooltip />
              </HeatmapChart>
            </div>
          </div>
        </div>
        <HeatmapLegend align="center" gap={GAP} />
      </div>
    </Shell>
  );
}

/** Loading shimmer, then real data after a fixed delay (settles). */
function LoadingToReadyHeatmap() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  useEffect(() => {
    const timer = window.setTimeout(() => setStatus("ready"), LOADING_FLIP_MS);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <Shell>
      <div className={WRAPPER_CLASS}>
        <HeatmapChart
          className="w-full min-w-0"
          data={sixMonthData}
          gap={GAP}
          layout="fluid"
          loadingLabel="Loading contributions"
          margin={GALLERY_MARGIN}
          status={status}
        >
          <HeatmapCells cornerRadius={2} />
          <HeatmapXAxis />
          <HeatmapYAxis />
          <HeatmapTooltip />
        </HeatmapChart>
        <HeatmapLegend align="center" gap={GAP} />
      </div>
    </Shell>
  );
}

export const HEATMAP_VARIANTS: readonly LabVariant[] = [
  {
    kind: "single",
    id: "default",
    label: "Heatmap",
    source: `${EXAMPLES}: Heatmap Chart`,
    exercises:
      "six months, gap 3, gallery margin, no hover dimming (inactive/active 1), centred legend",
    render: () => (
      <GalleryHeatmap activeScale={1} inactiveOpacity={1} inactiveScale={1} />
    ),
  },
  {
    kind: "single",
    id: "docs-preview",
    label: "Docs preview",
    source: `${DOCS}: ComponentPreview`,
    exercises:
      "one year, default gap 2 and margin, legend align end with HEATMAP_DEFAULT_LEVEL_STYLES",
    render: () => (
      <Shell>
        <div className="flex w-full flex-col items-stretch gap-3">
          <HeatmapChart className="w-full" data={yearData} layout="fluid">
            <HeatmapCells inactiveOpacity={1} inactiveScale={1} />
            <HeatmapXAxis />
            <HeatmapYAxis />
            <HeatmapTooltip />
          </HeatmapChart>
          <HeatmapLegend
            inactiveOpacity={1}
            inactiveScale={1}
            levelStyles={HEATMAP_DEFAULT_LEVEL_STYLES}
          />
        </div>
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "pattern-levels",
    label: "Pattern levels",
    source: `${EXAMPLES}: Heatmap Chart - Pattern Levels (also ${DOCS}: Level styles and patterns)`,
    exercises:
      "levelStyles with a diagonal pattern level (cells + legend), default hover dimming",
    render: () => <GalleryHeatmap levelStyles={patternLevelStyles} />,
  },
  {
    kind: "single",
    id: "solid-separators",
    label: "Solid separators",
    source: `${EXAMPLES}: Heatmap Chart - Solid Separators`,
    exercises:
      "quarter HeatmapSeparator, flat --border stroke, labels, spacing 20; compact odd Y axis",
    render: () => (
      <Shell>
        <div className={SEPARATOR_LABELS_WRAPPER_CLASS}>
          <HeatmapChart
            className="w-full min-w-0"
            data={sixMonthData}
            gap={GAP}
            layout="fluid"
            margin={GALLERY_MARGIN}
          >
            <HeatmapCells cornerRadius={2} />
            <HeatmapSeparator
              groupBy="quarter"
              labelClassName="text-black dark:text-white"
              showLabels
              spacing={SEPARATOR_SPACING}
              startOffset={SEPARATOR_START_OFFSET}
              stroke="var(--border)"
              strokeOpacity={1}
              strokeStyle="solid"
            />
            <HeatmapXAxis />
            <HeatmapYAxis labelFormat="initial" tickFilter="odd" />
            <HeatmapTooltip />
          </HeatmapChart>
          <HeatmapLegend align="center" gap={GAP} />
        </div>
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "compact-y-axis-quarters",
    label: "Compact Y axis & quarters",
    source: `${EXAMPLES}: Heatmap Chart - Compact Y Axis & Quarter Separators`,
    exercises: "quarter separators with a vertical gradient fade",
    render: () => (
      <Shell>
        <div className={SEPARATOR_LABELS_WRAPPER_CLASS}>
          <HeatmapChart
            className="w-full min-w-0"
            data={sixMonthData}
            gap={GAP}
            layout="fluid"
            margin={GALLERY_MARGIN}
          >
            <HeatmapCells cornerRadius={2} />
            <HeatmapSeparator
              gradient={HERO_SEPARATOR_GRADIENT}
              groupBy="quarter"
              labelClassName="text-black dark:text-white"
              showLabels
              spacing={SEPARATOR_SPACING}
              startOffset={SEPARATOR_START_OFFSET}
              stroke="var(--muted)"
              strokeOpacity={1}
              strokeStyle="solid"
            />
            <HeatmapXAxis />
            <HeatmapYAxis labelFormat="initial" tickFilter="odd" />
            <HeatmapTooltip />
          </HeatmapChart>
          <HeatmapLegend align="center" gap={GAP} />
        </div>
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "dashed-separators",
    label: "Dashed separators",
    source: `${EXAMPLES}: Heatmap Chart - Dashed Separators`,
    exercises: 'strokeStyle="dashed" + strokeDasharray, gradient, no Y axis',
    render: () => (
      <Shell>
        <div className={SEPARATOR_LABELS_WRAPPER_CLASS}>
          <HeatmapChart
            className="w-full min-w-0"
            data={sixMonthData}
            gap={GAP}
            layout="fluid"
            margin={GALLERY_MARGIN}
          >
            <HeatmapCells cornerRadius={2} />
            <HeatmapSeparator
              gradient={HERO_SEPARATOR_GRADIENT}
              groupBy="quarter"
              showLabels
              spacing={SEPARATOR_SPACING}
              startOffset={SEPARATOR_START_OFFSET}
              stroke="var(--muted)"
              strokeDasharray="3,5"
              strokeOpacity={1}
              strokeStyle="dashed"
            />
            <HeatmapXAxis />
            <HeatmapTooltip />
          </HeatmapChart>
          <HeatmapLegend align="center" gap={GAP} />
        </div>
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "hero",
    label: "Contributions (hero)",
    source: `${EXAMPLES}: makeHeatmapHero (Heatmap Chart - Contributions)`,
    exercises:
      "one year, circular cells (radius 999), inactive opacity/scale 0.8 on cells + legend, all Y ticks",
    render: () => (
      <Shell>
        <div className={SEPARATOR_LABELS_WRAPPER_CLASS}>
          <HeatmapChart
            className="w-full min-w-0"
            data={yearData}
            gap={GAP}
            layout="fluid"
            margin={GALLERY_MARGIN}
          >
            <HeatmapCells
              cornerRadius={CIRCULAR_CORNER_RADIUS}
              inactiveOpacity={HERO_INACTIVE_OPACITY}
              inactiveScale={HERO_INACTIVE_SCALE}
            />
            <HeatmapSeparator
              gradient={HERO_SEPARATOR_GRADIENT}
              groupBy="quarter"
              labelClassName={HERO_SEPARATOR_LABEL_CLASS}
              showLabels
              spacing={SEPARATOR_SPACING}
              startOffset={SEPARATOR_START_OFFSET}
              stroke="var(--muted)"
              strokeOpacity={1}
              strokeStyle="solid"
            />
            <HeatmapXAxis />
            <HeatmapYAxis labelFormat="initial" tickFilter="all" />
            <HeatmapTooltip />
          </HeatmapChart>
          <HeatmapLegend
            align="center"
            cornerRadius={CIRCULAR_CORNER_RADIUS}
            gap={GAP}
            inactiveOpacity={HERO_INACTIVE_OPACITY}
            inactiveScale={HERO_INACTIVE_SCALE}
          />
        </div>
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "dot-calendar",
    label: "Dot calendar (recipe)",
    source: `${RECIPES}: Dot calendar (DotCalendarPreview)`,
    exercises:
      "six months, circular cells, inactiveScale 0.94, separator gradient without stroke prop",
    render: () => (
      <Shell>
        <div className={SEPARATOR_LABELS_WRAPPER_CLASS}>
          <HeatmapChart
            className="w-full min-w-0"
            data={sixMonthData}
            gap={3}
            layout="fluid"
            margin={GALLERY_MARGIN}
          >
            <HeatmapCells
              cornerRadius={999}
              inactiveOpacity={0.8}
              inactiveScale={0.94}
            />
            <HeatmapSeparator
              gradient={RECIPE_SEPARATOR_FADE}
              groupBy="quarter"
              labelClassName="text-[var(--chart-3)]"
              showLabels
              spacing={20}
              startOffset={-20}
              strokeStyle="solid"
            />
            <HeatmapXAxis />
            <HeatmapYAxis labelFormat="initial" tickFilter="all" />
            <HeatmapTooltip />
          </HeatmapChart>
          <HeatmapLegend
            align="center"
            cornerRadius={999}
            gap={3}
            inactiveOpacity={0.8}
            inactiveScale={0.94}
          />
        </div>
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "horizontal-scroll",
    label: "Horizontal scroll",
    source: `${EXAMPLES}: Heatmap Chart - Horizontal Scroll`,
    exercises:
      "one year in a scroll container sized to ~26 visible weeks (scroll position 0), HTML y labels, no Y axis",
    render: () => <HorizontalScrollHeatmap />,
  },
  {
    kind: "single",
    id: "gradient-legend",
    label: "Gradient legend",
    source: `${EXAMPLES}: Heatmap Chart - Gradient Legend`,
    exercises:
      'custom solid levelStyles, legend variant="gradient" with cellSize/fontSize/labels',
    render: () => (
      <Shell>
        <div className={WRAPPER_CLASS}>
          <HeatmapChart
            className="w-full min-w-0"
            data={sixMonthData}
            gap={GAP}
            layout="fluid"
            levelStyles={performanceLevelStyles}
            margin={GALLERY_MARGIN}
          >
            <HeatmapCells cornerRadius={2} />
            <HeatmapXAxis />
            <HeatmapYAxis labelFormat="initial" tickFilter="odd" />
            <HeatmapTooltip />
          </HeatmapChart>
          <HeatmapLegend
            align="center"
            cellSize={11}
            fontSize={12}
            gap={GAP}
            labelClassName="text-muted-foreground"
            lessLabel="Faster"
            levelStyles={performanceLevelStyles}
            moreLabel="Slower"
            variant="gradient"
          />
        </div>
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "monday-start",
    label: "Monday start",
    source: `${EXAMPLES}: Heatmap Chart - Monday Start (also ${RECIPES}: Workweek focus, ${DOCS}: Monday-first grid)`,
    exercises:
      "weekStartDay 1, rowOpacity (faded weekends) on cells + Y axis, all ticks",
    render: () => (
      <Shell>
        <div className={WRAPPER_CLASS}>
          <HeatmapChart
            className="w-full min-w-0"
            data={sixMonthData}
            gap={GAP}
            layout="fluid"
            margin={GALLERY_MARGIN}
            weekStartDay={1}
          >
            <HeatmapCells cornerRadius={2} rowOpacity={WEEKEND_ROW_OPACITY} />
            <HeatmapXAxis />
            <HeatmapYAxis
              labelFormat="initial"
              rowOpacity={WEEKEND_ROW_OPACITY}
              tickFilter="all"
            />
            <HeatmapTooltip />
          </HeatmapChart>
          <HeatmapLegend align="center" gap={GAP} />
        </div>
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "active-scale",
    label: "Active scale hover",
    source: `${EXAMPLES}: Heatmap Chart - Active Scale Hover`,
    exercises: "activeScale 1.1, inactiveOpacity 0.45, gap 4 (cells + legend)",
    render: () => (
      <Shell>
        <div className={WRAPPER_CLASS}>
          <HeatmapChart
            className="w-full min-w-0"
            data={sixMonthData}
            gap={ACTIVE_SCALE_GAP}
            layout="fluid"
            margin={GALLERY_MARGIN}
          >
            <HeatmapCells
              activeScale={ACTIVE_SCALE}
              cornerRadius={2}
              inactiveOpacity={ACTIVE_SCALE_INACTIVE_OPACITY}
              inactiveScale={1}
            />
            <HeatmapXAxis />
            <HeatmapYAxis labelFormat="initial" tickFilter="odd" />
            <HeatmapTooltip />
          </HeatmapChart>
          <HeatmapLegend
            activeScale={ACTIVE_SCALE}
            align="center"
            gap={ACTIVE_SCALE_GAP}
            inactiveOpacity={ACTIVE_SCALE_INACTIVE_OPACITY}
            inactiveScale={1}
          />
        </div>
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "fixed-bins",
    label: "Fixed bins & level colors",
    source: `${DOCS}: props tables (binSize, levelColors, rowOpacity number, every-N separator)`,
    exercises:
      'binSize 14, custom levelColors, rowOpacity 0.6, groupBy="every" 4 with spacing 6, legend align start, instant tooltip',
    render: () => (
      <Shell>
        <div className={WRAPPER_CLASS}>
          <HeatmapChart
            binSize={14}
            data={sixMonthData}
            gap={2}
            levelColors={customLevelColors}
          >
            <HeatmapCells cornerRadius={4} rowOpacity={0.6} />
            <HeatmapSeparator every={4} groupBy="every" spacing={6} />
            <HeatmapXAxis />
            <HeatmapYAxis tickFilter="even" />
            <HeatmapTooltip instant />
          </HeatmapChart>
          <HeatmapLegend align="start" cornerRadius={4} />
        </div>
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "static-no-animate",
    label: "No animation, not interactive",
    source: `${DOCS}: props tables (animate, interactive, xDomain)`,
    exercises:
      "animate={false}, xDomain filtering to the last 12 weeks, interactive={false} (no hover)",
    hover: false,
    render: () => (
      <Shell>
        <div className={WRAPPER_CLASS}>
          <HeatmapChart
            animate={false}
            className="w-full min-w-0"
            data={yearData}
            layout="fluid"
            margin={GALLERY_MARGIN}
            xDomain={[
              yearData.at(-12)?.bins[0]?.date ?? new Date(0),
              yearData.at(-1)?.bins.at(-1)?.date ?? new Date(0),
            ]}
          >
            <HeatmapCells interactive={false} />
            <HeatmapXAxis />
            <HeatmapYAxis />
          </HeatmapChart>
          <HeatmapLegend interactive={false} />
        </div>
      </Shell>
    ),
  },
  {
    kind: "single",
    id: "loading-to-ready",
    label: "Loading → ready",
    source: `${DOCS}: props tables (status, loadingLabel) — settling stand-in for ${EXAMPLES}: Heatmap Chart - Loading`,
    exercises: `status "loading" → "ready" after ${LOADING_FLIP_MS} ms: shimmer conceal + fromLoading reveal, loading label exit`,
    render: () => <LoadingToReadyHeatmap />,
  },
  {
    kind: "single",
    id: "loading",
    label: "Loading",
    source: `${EXAMPLES}: Heatmap Chart - Loading`,
    exercises: "HeatmapChartLoading skeleton grid, shimmer, label",
    hover: false,
    previewOnly:
      "loading shimmer loops forever with Math.random() targets/durations inside HeatmapCells, and the ShimmeringText label repeats infinitely, so it never settles",
    render: () => (
      <HeatmapChartLoading
        className="w-full min-w-0"
        cornerRadius={2}
        data={sixMonthData}
        gap={GAP}
        label="Loading contributions"
        margin={GALLERY_MARGIN}
      />
    ),
  },
];
