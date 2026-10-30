"use client";

import type { ChartMarker } from "@bklitui/ui/charts";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { daysAgo, LAB_NOW, seededRandom } from "./deterministic";

/**
 * Data and helpers shared by the line / profit-loss / live-line lab variants.
 * Copied verbatim from the sources (chart-examples.tsx, components/docs/*,
 * components/recipes/*) with every clock read replaced by `LAB_NOW` /
 * `daysAgo(n)` and every `Math.random()` by a seeded generator.
 */

/** `createChartExamplePreview` margin (desktop), see lib/chart-example-margin. */
export const EXAMPLE_MARGIN = { top: 20, right: 8, bottom: 40, left: 8 };

// ---------------------------------------------------------------------------
// chart-examples.tsx
// ---------------------------------------------------------------------------

export const lineData = [
  { date: new Date(2024, 0, 1), desktop: 186 },
  { date: new Date(2024, 1, 1), desktop: 305 },
  { date: new Date(2024, 2, 1), desktop: 237 },
  { date: new Date(2024, 3, 1), desktop: 73 },
  { date: new Date(2024, 4, 1), desktop: 209 },
  { date: new Date(2024, 5, 1), desktop: 214 },
];

export const multiLineData = [
  { date: new Date(2024, 0, 1), desktop: 186, mobile: 80 },
  { date: new Date(2024, 1, 1), desktop: 305, mobile: 200 },
  { date: new Date(2024, 2, 1), desktop: 237, mobile: 120 },
  { date: new Date(2024, 3, 1), desktop: 73, mobile: 190 },
  { date: new Date(2024, 4, 1), desktop: 209, mobile: 130 },
  { date: new Date(2024, 5, 1), desktop: 214, mobile: 140 },
];

export const chartMarginLeftYAxis = {
  top: 8,
  right: 8,
  bottom: 40,
  left: 56,
} as const;

export const chartMarginBiaxialYAxis = {
  top: 8,
  right: 56,
  bottom: 40,
  left: 56,
} as const;

export const lineMarkers: ChartMarker[] = [
  {
    date: new Date(2024, 2, 1),
    icon: "🚀",
    title: "v2.0 Launch",
    description: "Major release with new features",
  },
  {
    date: new Date(2024, 4, 1),
    icon: "📈",
    title: "Marketing Push",
    description: "Started new ad campaign",
  },
];

/** `lib/weekly-visitors-demo-data.ts` with `now` pinned to `LAB_NOW`. */
const WEEKLY_VISITOR_COUNTS = [820, 940, 880, 1020, 960, 1100, 420] as const;

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export const weeklyVisitorsData: Record<string, unknown>[] = (() => {
  const today = startOfDay(new Date(LAB_NOW));
  return WEEKLY_VISITOR_COUNTS.map((visitors, index) => {
    const offset = index - (WEEKLY_VISITOR_COUNTS.length - 1);
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return { date, visitors, projected: offset === 0 };
  });
})();

export const weeklyVisitorsDashFromIndex = weeklyVisitorsData.length - 2;

// ---------------------------------------------------------------------------
// components/docs (Date.now() → daysAgo)
// ---------------------------------------------------------------------------

/** docs/line-chart-docs-data.ts `lineChartDocsData` (30 days). */
const DOCS_USERS = [
  1200, 1350, 1100, 1450, 1380, 1520, 1600, 1480, 1550, 1420, 1680, 1750, 1620,
  1580, 1720, 1850, 1780, 1650, 1920, 1880, 1750, 1980, 2050, 1920, 2100, 2180,
  2050, 2250, 2320, 2400,
];
const DOCS_PAGEVIEWS = [
  4500, 4800, 4200, 5100, 4900, 5400, 5800, 5200, 5500, 5000, 6100, 6400, 5900,
  5700, 6200, 6800, 6500, 6000, 7100, 6900, 6400, 7300, 7600, 7100, 7800, 8100,
  7600, 8400, 8700, 9000,
];
export const lineChartDocsData = DOCS_USERS.map((users, index) => ({
  date: daysAgo(29 - index),
  users,
  pageviews: DOCS_PAGEVIEWS[index] ?? 0,
}));

export const lineChartDocsMarkers: ChartMarker[] = [
  {
    date: daysAgo(5),
    icon: "🚀",
    title: "v1.2.0 Released",
    description: "New chart animations",
    href: "https://github.com/bklit/bklit-ui/releases",
    target: "_blank",
  },
  {
    date: daysAgo(5),
    icon: "🐛",
    title: "Bug Fix",
    description: "Fixed tooltip positioning",
    href: "https://github.com/bklit/bklit-ui/issues",
    target: "_blank",
  },
  {
    date: daysAgo(5),
    icon: "📦",
    title: "Dependency Update",
    description: "Updated motion to v12",
    href: "https://motion.dev",
    target: "_blank",
  },
  {
    date: daysAgo(5),
    icon: "⚡",
    title: "Performance",
    description: "50% faster renders",
    href: "#performance",
    target: "_self",
  },
  {
    date: daysAgo(12),
    icon: "✨",
    title: "Feature Launch",
    description: "Added grid support",
    href: "#grid",
    target: "_self",
  },
  {
    date: daysAgo(20),
    icon: "🎨",
    title: "Design Update",
    description: "New color system",
    href: "#theming",
    target: "_self",
  },
  {
    date: daysAgo(20),
    icon: "📝",
    title: "Docs Updated",
    description: "Added examples",
    href: "#usage",
    target: "_self",
  },
];

/** docs/axis-demo.tsx (7 days). */
export const axisDemoData = [1200, 1450, 1380, 1620, 1850, 1750, 2100].map(
  (value, index) => ({ date: daysAgo(6 - index), value })
);

/** docs/background-demo.tsx, docs/grid-demo.tsx (8 points, 4 days apart). */
export const sparseValueData = [
  { date: daysAgo(29), value: 1200 },
  { date: daysAgo(25), value: 1450 },
  { date: daysAgo(21), value: 1380 },
  { date: daysAgo(17), value: 1620 },
  { date: daysAgo(13), value: 1850 },
  { date: daysAgo(9), value: 1750 },
  { date: daysAgo(5), value: 2100 },
  { date: daysAgo(1), value: 2320 },
];

/** docs/tooltip-demo.tsx. */
export const tooltipDemoData = [
  { date: daysAgo(29), users: 1200, pageviews: 4500 },
  { date: daysAgo(25), users: 1450, pageviews: 5100 },
  { date: daysAgo(21), users: 1380, pageviews: 4900 },
  { date: daysAgo(17), users: 1620, pageviews: 5800 },
  { date: daysAgo(13), users: 1850, pageviews: 6800 },
  { date: daysAgo(9), users: 1750, pageviews: 6400 },
  { date: daysAgo(5), users: 2100, pageviews: 7800 },
  { date: daysAgo(1), users: 2320, pageviews: 8700 },
];

/** docs/segment-demo.tsx. */
export const segmentDemoData = [
  { date: daysAgo(29), users: 1200 },
  { date: daysAgo(27), users: 1100 },
  { date: daysAgo(25), users: 1380 },
  { date: daysAgo(23), users: 1600 },
  { date: daysAgo(21), users: 1550 },
  { date: daysAgo(19), users: 1680 },
  { date: daysAgo(17), users: 1620 },
  { date: daysAgo(15), users: 1720 },
  { date: daysAgo(13), users: 1780 },
  { date: daysAgo(11), users: 1920 },
  { date: daysAgo(9), users: 1750 },
  { date: daysAgo(7), users: 2050 },
  { date: daysAgo(5), users: 2100 },
  { date: daysAgo(3), users: 2050 },
  { date: daysAgo(1), users: 2320 },
  { date: new Date(LAB_NOW), users: 2400 },
];

/** docs/line-chart-brush-demo.tsx. */
export const brushData = Array.from({ length: 30 }, (_, index) => {
  const date = new Date("2025-01-01");
  date.setDate(date.getDate() + index);
  return {
    date,
    value: Math.round(420 + Math.sin(index * 0.7) * 90 + index * 14),
  };
});

/** docs/line-chart-y-domain-demo.tsx. */
export const yDomainReadyData = Array.from({ length: 12 }, (_, index) => {
  const date = new Date("2025-01-01");
  date.setDate(date.getDate() + index);
  return {
    date,
    value: Math.round(420 + Math.sin(index * 0.9) * 80 + index * 18),
  };
});

/** docs/line-chart-date-range-demo.tsx (`new Date()` → LAB_NOW, seeded noise). */
const DATASET_SCALE = {
  revenue: { base: 15_000, amplitude: 3000 },
  high: { base: 1000, amplitude: 200 },
  low: { base: 10, amplitude: 2 },
} as const;

export type DateRangeDataset = keyof typeof DATASET_SCALE;

export const dateRangeFullData = (() => {
  const random = seededRandom(90);
  return Array.from({ length: 90 }, (_, index) => {
    const date = new Date(LAB_NOW);
    date.setDate(date.getDate() - (89 - index));
    const wave = Math.sin(index * 0.15);
    const noise = random();
    const trend = index / 90;
    const point: Record<string, Date | number> = { date };
    for (const [key, { base, amplitude }] of Object.entries(DATASET_SCALE)) {
      point[key] = Math.round(
        base +
          wave * amplitude +
          noise * amplitude * 0.66 +
          trend * amplitude * 1.5
      );
    }
    return point;
  });
})();

/** docs/line-chart-studio-trio-demo.tsx (components/charts). */
export const trioData = Array.from({ length: 30 }, (_, index) => {
  const date = new Date(2025, 0, 1 + index);
  return {
    date,
    desktop: Math.round(180 + Math.sin(index / 4.2) * 70 + ((index * 9) % 31)),
    mobile: Math.round(120 + Math.cos(index / 3.8) * 55 + ((index * 5) % 23)),
    tablet: Math.round(
      150 + Math.sin(index / 5.1 + 1) * 48 + ((index * 7) % 19)
    ),
  };
});

/** docs/markers-demo.tsx. */
const MARKERS_DAY_MS = 24 * 60 * 60 * 1000;
const MARKERS_START = new Date(2024, 0, 1).getTime();

function markersDayAt(index: number) {
  return new Date(MARKERS_START + index * MARKERS_DAY_MS);
}

export const markersDemoData = Array.from({ length: 14 }, (_, i) => ({
  date: markersDayAt(i),
  value: Math.floor(
    1200 + i * 55 + Math.sin(i / 1.6) * 260 + Math.cos(i / 0.9) * 90
  ),
}));

export const richMarkers: ChartMarker[] = [
  {
    date: markersDayAt(3),
    icon: "🚀",
    title: "v2.0 Launch",
    description: "Major release with new features",
    href: "https://github.com/bklit/bklit-ui/releases",
    target: "_blank",
  },
  {
    date: markersDayAt(8),
    icon: "📣",
    title: "Marketing Push",
    description: "New ad campaign went live",
  },
  {
    date: markersDayAt(8),
    icon: "🐛",
    title: "Bug Fix",
    description: "Fixed tooltip positioning",
  },
  {
    date: markersDayAt(8),
    icon: "⚡",
    title: "Performance",
    description: "50% faster renders",
  },
  {
    date: markersDayAt(11),
    icon: "📦",
    title: "Dependency Update",
    description: "Updated motion to v12",
    color: "var(--chart-1)",
  },
];

/** docs/band-demo.tsx. */
function bandDemoValue(index: number): number {
  const trend = 4.2 * index;
  const swell = Math.sin(index / 3.6) * 22;
  const ripple = Math.cos(index / 1.45) * 11;
  const jitter = Math.sin(index / 0.62) * 6;
  return Math.round(140 + trend + swell + ripple + jitter);
}

export const bandRangeData = Array.from({ length: 24 }, (_, i) => {
  const value = bandDemoValue(i);
  return {
    date: new Date(2024, 0, i + 1),
    value,
    valueUpper: Math.round(
      value + value * 0.12 * (0.75 + 0.25 * Math.sin(i / 1.9))
    ),
    valueLower: Math.round(
      value - value * 0.12 * (0.75 + 0.25 * Math.cos(i / 2.6))
    ),
  };
});

function priceDemoValue(index: number): number {
  const trend = 1.6 * index;
  const swell = Math.sin(index / 6.5) * 26;
  const chop = Math.sin(index / 1.3) * 9 + Math.cos(index / 0.71) * 6;
  const shock = index > 34 && index < 44 ? Math.sin((index - 34) / 3) * 18 : 0;
  return Math.round(120 + trend + swell + chop + shock);
}

export const bandPriceData = Array.from({ length: 60 }, (_, i) => ({
  date: new Date(2024, 0, i + 1),
  price: priceDemoValue(i),
}));

export const temperatureData = Array.from({ length: 30 }, (_, i) => {
  const mid = 18 + Math.sin(i / 5.2) * 5 + Math.cos(i / 2.3) * 1.5;
  const spread = 4.5 + Math.sin(i / 3.1 + 1) * 1.8;
  return {
    date: new Date(2024, 5, i + 1),
    low: Math.round(mid - spread),
    high: Math.round(mid + spread),
  };
});

export const teamData = Array.from({ length: 24 }, (_, i) => {
  const teamA = 34 + Math.sin(i / 3.4) * 9 + i * 0.6;
  const teamB = 62 + Math.cos(i / 4.1) * 10 - i * 0.4;
  const spreadA = 6 + Math.sin(i / 2.2) * 2;
  const spreadB = 8 + Math.cos(i / 2.7) * 3;
  return {
    date: new Date(2024, 0, i + 1),
    teamA: Math.round(teamA),
    teamAMin: Math.round(teamA - spreadA),
    teamAMax: Math.round(teamA + spreadA * 1.2),
    teamB: Math.round(teamB),
    teamBMin: Math.round(teamB - spreadB * 1.1),
    teamBMax: Math.round(teamB + spreadB),
  };
});

/** docs/date-highlights-demo.tsx. */
const DH_DAY_COUNT = 22;

function dayDate(index: number): Date {
  return new Date(2026, 9, 1 + index);
}

export const projectProgressData = Array.from(
  { length: DH_DAY_COUNT },
  (_, index) => {
    const u = index / (DH_DAY_COUNT - 1);
    return {
      date: dayDate(index),
      scope: Math.round(48 * (1 - Math.exp(-u * 6)) + 2 * u),
      started: Math.round(46 * (1 - Math.exp(-u * 2.6))),
      completed: Math.round(43 * (1 - Math.exp(-u * 2.2))),
    };
  }
);

export const PROJECT_DUE_DATE = dayDate(14);

export const longRangeData = Array.from({ length: 120 }, (_, index) => ({
  date: new Date(2026, 6, 1 + index),
  value: Math.round(320 + Math.sin(index / 6) * 60 + index * 2.4),
}));

export const LONG_RANGE_DUE_DATE = new Date(2026, 9, 1);

/** docs/line-chart-glow-demo.tsx. */
const GLOW_DEMO_POINT_COUNT = 28;

function glowDemoValue(index: number): number {
  const t = index / (GLOW_DEMO_POINT_COUNT - 1);
  const hill = 18 * Math.exp(-(((t - 0.36) / 0.2) ** 2));
  const shoulder = 6 * Math.exp(-(((t - 0.72) / 0.12) ** 2));
  return Math.round((30 + hill + shoulder - 6 * t) * 10) / 10;
}

export const glowData = Array.from(
  { length: GLOW_DEMO_POINT_COUNT },
  (_, i) => ({
    date: new Date(2026, 9, i + 1),
    sessions: glowDemoValue(i),
  })
);

// ---------------------------------------------------------------------------
// components/recipes/recipe-data.ts
// ---------------------------------------------------------------------------

function recipeDay(offset: number): Date {
  return new Date(2026, 0, 5 + offset);
}

export const recipeDailyData = Array.from({ length: 28 }, (_, index) => {
  const trend = 1400 + index * 38;
  const weekly = Math.sin((index / 7) * Math.PI * 2) * 180;
  const noise = Math.sin(index * 2.3) * 90 + Math.cos(index * 1.1) * 60;
  const visitors = Math.round(trend + weekly + noise);
  return {
    date: recipeDay(index),
    visitors,
    previous: Math.round(visitors * 0.78 + Math.cos(index * 0.9) * 110),
  };
});

export const recipeWeeklyData = Array.from({ length: 12 }, (_, index) => {
  const value =
    820 + index * 64 + Math.sin(index * 1.4) * 120 + Math.cos(index * 0.6) * 70;
  return {
    date: recipeDay(index * 7),
    visitors: Math.round(value),
  };
});

export const recipeRangeData = recipeDailyData.map((row, index) => {
  const spread = row.visitors * (0.13 + 0.04 * Math.sin(index / 2.4));
  return {
    date: row.date,
    visitors: row.visitors,
    low: Math.round(row.visitors - spread * (0.85 + 0.15 * Math.cos(index))),
    high: Math.round(row.visitors + spread),
  };
});

export const recipeEventMarkers: ChartMarker[] = [
  {
    date: recipeDay(5),
    icon: "🚀",
    title: "v2.0 launch",
    description: "New dashboard shipped",
  },
  {
    date: recipeDay(13),
    icon: "📣",
    title: "Newsletter",
    description: "Monthly send to 40k readers",
  },
  {
    date: recipeDay(13),
    icon: "🐛",
    title: "Hotfix",
    description: "Checkout bug fixed",
  },
  {
    date: recipeDay(21),
    icon: "⚡",
    title: "Perf release",
    description: "Pages load 40% faster",
    color: "var(--chart-1)",
  },
];

export const recipeDiamondMarkers = [
  { date: recipeDay(7), title: "Deploy" },
  { date: recipeDay(16), title: "Pricing change" },
  { date: recipeDay(23), title: "Campaign" },
];

/** lib/recipes/snippets.ts */
export const PATTERN_FADE_EDGE = 33;

// ---------------------------------------------------------------------------
// Scripted state (fixed timers instead of buttons / toggles)
// ---------------------------------------------------------------------------

/**
 * Starts at `initial`, then applies each `[ms, value]` step on a fixed timer
 * after mount (the source drove these from buttons). Pick times while the
 * chart is still animating (enter or a loading loop), so the recorder's
 * 400 ms quiet window never opens before the last step.
 */
export function useScriptedState<T>(
  initial: T,
  steps: readonly (readonly [number, T])[]
): T {
  const [value, setValue] = useState(initial);
  // The script is fixed at mount (a StrictMode remount restarts it).
  const scriptRef = useRef({ initial, steps });
  useEffect(() => {
    const script = scriptRef.current;
    setValue(script.initial);
    const timers = script.steps.map(([ms, next]) =>
      setTimeout(() => setValue(next), ms)
    );
    return () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };
  }, []);
  return value;
}

/**
 * Starts a mouse drag on the first time-series chart inside, as soon as the
 * chart accepts input (its plot group switches to `cursor: crosshair` once
 * the enter reveal finishes), and keeps the button held: `mousedown` at
 * `from`, `mousemove` to `to` (fractions of the plot width). The lab's hover
 * steps then extend the selection; its leave step ends it. Lets the segment
 * examples ("click and drag") be recorded without a real pointer.
 */
export function HeldDrag({
  children,
  from = 0.1,
  to = 0.45,
}: {
  children: ReactNode;
  from?: number;
  to?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const group = ref.current?.querySelector(
        'svg > g[transform][style*="crosshair"]'
      );
      const rect = group?.querySelector(':scope > rect[fill="transparent"]');
      if (!rect) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const box = rect.getBoundingClientRect();
      const fire = (type: string, fraction: number) => {
        rect.dispatchEvent(
          new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: box.left + box.width * fraction,
            clientY: box.top + box.height / 2,
            view: window,
          })
        );
      };
      fire("mouseover", from);
      fire("mousedown", from);
      fire("mousemove", to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to]);
  return (
    <div className="w-full" ref={ref}>
      {children}
    </div>
  );
}
