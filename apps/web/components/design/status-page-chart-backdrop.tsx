"use client";

import {
  AreaSparkline,
  BarSparkline,
  Grid,
  LineSparkline,
  PieChart,
  type PieData,
  PieSlice,
  RadarArea,
  RadarChart,
  type RadarData,
  RadarGrid,
  type RadarMetric,
  Scatter,
  ScatterChart,
  StaticChartPreviewProvider,
} from "@bklitui/ui/charts";
import type { Transition } from "motion/react";
import { memo, type ReactNode } from "react";

/*
 * Decorative "dashboard floor" behind the 404 / error pages: a grid of real
 * bklit charts, tipped into an isometric plane and faded out on every side.
 * Everything is static — fixed pixel sizes (no ResizeObserver for the
 * sparklines / pie / radar), no animation, no tooltips, no pointer events.
 */

const TILE_WIDTH = 240;
const TILE_HEIGHT = 160;
const CHART_WIDTH = 216;
const CHART_HEIGHT = 104;
const COLUMNS = 5;

/** Zero-length enter transition for charts that tween on mount. */
const INSTANT: Transition = { duration: 0 };

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

/** Small deterministic PRNG (LCG) so SSR and hydration match. */
function seeded(seed: number) {
  let state = seed % 4_294_967_296;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
}

interface Point {
  value: number;
}

function walk(seed: number, length: number): Point[] {
  const rand = seeded(seed);
  let value = 40 + rand() * 20;
  return Array.from({ length }, () => {
    value = Math.min(100, Math.max(5, value + (rand() - 0.45) * 18));
    return { value: Math.round(value) };
  });
}

const DAY_MS = 86_400_000;
const SCATTER_START = Date.UTC(2026, 0, 1);

function scatterData(seed: number) {
  const rand = seeded(seed);
  return Array.from({ length: 18 }, (_, i) => ({
    date: new Date(SCATTER_START + i * DAY_MS),
    a: Math.round(20 + i * 3 + rand() * 30),
    b: Math.round(70 - i * 2 + rand() * 25),
  }));
}

function pieData(seed: number): PieData[] {
  const rand = seeded(seed);
  return COLORS.slice(0, 4).map((color, i) => ({
    label: `Slice ${i + 1}`,
    value: Math.round(10 + rand() * 40),
    color,
  }));
}

const RADAR_METRICS: RadarMetric[] = [
  { key: "a", label: "A" },
  { key: "b", label: "B" },
  { key: "c", label: "C" },
  { key: "d", label: "D" },
  { key: "e", label: "E" },
];

function radarData(seed: number): RadarData[] {
  const rand = seeded(seed);
  const series = (color: string): RadarData => ({
    label: color,
    color,
    values: Object.fromEntries(
      RADAR_METRICS.map(({ key }) => [key, Math.round(35 + rand() * 65)])
    ),
  });
  return [series(COLORS[0]), series(COLORS[2])];
}

type Tile =
  | { kind: "line" | "area" | "bar"; data: Point[]; color: string }
  | { kind: "pie"; data: PieData[]; donut: boolean }
  | { kind: "radar"; data: RadarData[] }
  | { kind: "scatter"; data: ReturnType<typeof scatterData> };

const spark = (
  kind: "line" | "area" | "bar",
  seed: number,
  colorIndex: number
): Tile => ({
  kind,
  data: walk(seed, kind === "bar" ? 16 : 28),
  color: COLORS[colorIndex % COLORS.length] as string,
});

/** 20 tiles, 5 × 4. Kinds are interleaved so neighbours never repeat. */
const TILES: Tile[] = [
  spark("area", 1, 0),
  spark("bar", 2, 1),
  { kind: "pie", data: pieData(3), donut: true },
  spark("line", 4, 2),
  { kind: "scatter", data: scatterData(5) },

  spark("line", 6, 3),
  { kind: "radar", data: radarData(7) },
  spark("area", 8, 1),
  spark("bar", 9, 0),
  spark("line", 10, 4),

  spark("bar", 11, 2),
  spark("area", 12, 4),
  { kind: "scatter", data: scatterData(13) },
  { kind: "pie", data: pieData(14), donut: false },
  spark("area", 15, 3),

  { kind: "radar", data: radarData(16) },
  spark("line", 17, 0),
  spark("bar", 18, 3),
  spark("area", 19, 2),
  spark("line", 20, 1),
];

const KEYED_TILES = TILES.map((tile, index) => ({
  key: `${tile.kind}-${index}`,
  tile,
}));

function TileChart({ tile }: { tile: Tile }): ReactNode {
  switch (tile.kind) {
    case "line":
      return (
        <LineSparkline
          animate={false}
          color={tile.color}
          data={tile.data}
          dataKey="value"
          height={CHART_HEIGHT}
          interactive={false}
          strokeWidth={2}
          width={CHART_WIDTH}
        />
      );
    case "area":
      return (
        <AreaSparkline
          animate={false}
          color={tile.color}
          data={tile.data}
          dataKey="value"
          height={CHART_HEIGHT}
          interactive={false}
          strokeWidth={2}
          width={CHART_WIDTH}
        />
      );
    case "bar":
      return (
        <BarSparkline
          animate={false}
          barGap={4}
          barRadius={2}
          color={tile.color}
          data={tile.data}
          dataKey="value"
          height={CHART_HEIGHT}
          interactive={false}
          width={CHART_WIDTH}
        />
      );
    case "pie":
      return (
        <PieChart
          data={tile.data}
          hoverOffset={0}
          innerRadius={tile.donut ? 30 : 0}
          padAngle={0.04}
          size={CHART_HEIGHT}
        >
          {tile.data.map((slice, index) => (
            <PieSlice
              animate={false}
              hoverEffect="none"
              index={index}
              key={slice.label}
              showGlow={false}
            />
          ))}
        </PieChart>
      );
    case "radar":
      return (
        // `animate={false}` only covers the grid; areas still run their
        // mount tween, so make it instant too.
        <RadarChart
          animate={false}
          data={tile.data}
          enterDurationMs={0}
          enterTransition={INSTANT}
          levels={4}
          margin={6}
          metrics={RADAR_METRICS}
          size={CHART_HEIGHT}
        >
          <RadarGrid showLabels={false} />
          {tile.data.map((series, index) => (
            <RadarArea
              index={index}
              key={series.label}
              showGlow={false}
              showPoints={false}
            />
          ))}
        </RadarChart>
      );
    case "scatter":
      // Time-series shell sizes itself from its parent, so give it a fixed box.
      return (
        <div style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
          <ScatterChart
            animationDuration={0}
            aspectRatio={`${CHART_WIDTH} / ${CHART_HEIGHT}`}
            data={tile.data}
            enterTransition={INSTANT}
            margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
          >
            <Grid horizontal />
            <Scatter animate={false} dataKey="a" />
            <Scatter animate={false} dataKey="b" />
          </ScatterChart>
        </div>
      );
    default:
      return null;
  }
}

function BackdropTile({ tile }: { tile: Tile }) {
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border border-foreground bg-card p-3"
      style={{ width: TILE_WIDTH, height: TILE_HEIGHT }}
    >
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-14 rounded-full bg-foreground" />
        <span className="h-1.5 w-6 rounded-full bg-foreground/50" />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <TileChart tile={tile} />
      </div>
    </div>
  );
}

/**
 * Isometric field of static charts. Render inside a `relative` container;
 * it fills it, sits behind content, and is hidden from assistive tech.
 */
export const StatusPageChartBackdrop = memo(function StatusPageChartBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-1 flex select-none items-center justify-center overflow-hidden opacity-[0.06] [mask-image:radial-gradient(ellipse_closest-side_at_center,black_35%,transparent_100%)] dark:opacity-[0.08]"
      inert
    >
      <StaticChartPreviewProvider>
        <div
          className="grid shrink-0 gap-4 [--backdrop-scale:0.55] sm:[--backdrop-scale:0.75] lg:[--backdrop-scale:0.95] xl:[--backdrop-scale:1.1]"
          style={{
            gridTemplateColumns: `repeat(${COLUMNS}, ${TILE_WIDTH}px)`,
            transform:
              "rotateX(55deg) rotateZ(-45deg) scale(var(--backdrop-scale))",
          }}
        >
          {KEYED_TILES.map(({ key, tile }) => (
            <BackdropTile key={key} tile={tile} />
          ))}
        </div>
      </StaticChartPreviewProvider>
    </div>
  );
});
