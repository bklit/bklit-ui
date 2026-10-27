"use client";

import {
  ChartTooltip,
  Line,
  LineBackdrop,
  type LineBackdropStop,
  LineChart,
  type LineHighlight,
} from "@bklitui/ui/charts";

const GLOW_DEMO_POINT_COUNT = 28;
const LAST_WEEK_OFFSET = 7;

function glowDemoValue(index: number): number {
  const t = index / (GLOW_DEMO_POINT_COUNT - 1);
  const hill = 18 * Math.exp(-(((t - 0.36) / 0.2) ** 2));
  const shoulder = 6 * Math.exp(-(((t - 0.72) / 0.12) ** 2));
  return Math.round((30 + hill + shoulder - 6 * t) * 10) / 10;
}

/** A gentle hill: low on the left, a peak a third of the way in, then a long slope. */
const glowData = Array.from({ length: GLOW_DEMO_POINT_COUNT }, (_, i) => ({
  date: new Date(2026, 9, i + 1),
  sessions: glowDemoValue(i),
}));

/** Headroom so the line sits low and the glow has sky above it. */
const GLOW_DEMO_DOMAIN_MAX = 105;

/** Warm horizon (near the line) → dusk purple → transparent. */
const SKY_STOPS: LineBackdropStop[] = [
  { offset: 0, color: "var(--sunset-horizon)", opacity: 1 },
  { offset: 0.22, color: "var(--sunset-horizon)", opacity: 0.85 },
  { offset: 0.45, color: "var(--sunset-warm)", opacity: 0.7 },
  { offset: 0.7, color: "var(--sunset-dusk)", opacity: 0.45 },
  { offset: 1, color: "var(--sunset-dusk)", opacity: 0 },
];

/** Golden pool on the right where the line runs yellow. */
const SUN_STOPS: LineBackdropStop[] = [
  { offset: 0, color: "var(--sunset-sun)", opacity: 0.6 },
  { offset: 1, color: "var(--sunset-sun)", opacity: 0 },
];

const LINE_GRADIENT = [
  "var(--sunset-line-start)",
  "var(--sunset-line-mid)",
  "var(--sunset-line-end)",
];

/** Bright, soft-ended segment that follows the cursor along the curve. */
const HIGHLIGHT: LineHighlight = {
  dimOpacity: 0.25,
  fadeLength: 40,
  glow: { blur: 6, opacity: 1 },
  span: 3,
  strokeWidth: 2.5,
};

const STARS = [
  { left: "38%", top: "13%" },
  { left: "77%", top: "4%" },
  { left: "92%", top: "26%" },
  { left: "14%", top: "22%" },
];

const dayFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function GlowTooltipContent({
  point,
  index,
}: {
  point: Record<string, unknown>;
  index: number;
}) {
  const value = point.sessions as number;
  const lastWeek = glowData[index - LAST_WEEK_OFFSET]?.sessions;
  const change =
    lastWeek === undefined ? null : ((value - lastWeek) / lastWeek) * 100;
  const isNormal = change === null || Math.abs(change) < 15;
  return (
    <div className="w-64 space-y-2 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-sm">
          {dayFmt.format(point.date as Date)}
        </span>
        <span
          className={
            isNormal
              ? "flex items-center gap-1.5 text-emerald-600 text-xs dark:text-emerald-400"
              : "flex items-center gap-1.5 text-amber-600 text-xs dark:text-amber-400"
          }
        >
          <span aria-hidden className="size-2 bg-current" />
          {isNormal ? "Normal" : "Unusual"}
        </span>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {value.toFixed(1)}k sessions
        {change === null
          ? "."
          : ` — ${change >= 0 ? "up" : "down"} ${Math.abs(change).toFixed(0)}% on last week.`}
      </p>
    </div>
  );
}

export function LineChartGlowDemo() {
  return (
    <div
      className={[
        "relative w-full overflow-hidden rounded-xl bg-(--sunset-bg)",
        "[--sunset-bg:#faf7f2] dark:[--sunset-bg:#19181d]",
        "[--sunset-horizon:#f6a560] dark:[--sunset-horizon:#b4703c]",
        "[--sunset-warm:#f3b48a] dark:[--sunset-warm:#7a4650]",
        "[--sunset-dusk:#c9b2e6] dark:[--sunset-dusk:#3e2a48]",
        "[--sunset-sun:#f2cf6b] dark:[--sunset-sun:#8a6a2a]",
        "[--sunset-line-start:#e2572a] dark:[--sunset-line-start:#d9622b]",
        "[--sunset-line-mid:#ec8f2f] dark:[--sunset-line-mid:#f0b25a]",
        "[--sunset-line-end:#d9a21f] dark:[--sunset-line-end:#f7dc9a]",
        "[--sunset-dot:#e8742a] dark:[--sunset-dot:#fff1d0]",
      ].join(" ")}
    >
      <LineChart
        aspectRatio="7 / 5"
        data={glowData}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        yScaleDomainMax={GLOW_DEMO_DOMAIN_MAX}
      >
        <LineBackdrop
          center={{ x: 0.45, y: 0.82 }}
          dataKey="sessions"
          radius={{ x: 0.95, y: 0.6 }}
          stops={SKY_STOPS}
        />
        <LineBackdrop
          center={{ x: 0.88, y: 0.85 }}
          dataKey="sessions"
          radius={{ x: 0.35, y: 0.22 }}
          stops={SUN_STOPS}
        />
        {/* Stars live in a backdrop too, so they fade in with the glow. */}
        <LineBackdrop dataKey="sessions">
          {STARS.map((star) => (
            <rect
              className="hidden fill-white/30 dark:block"
              height={3}
              key={`${star.left}-${star.top}`}
              width={3}
              x={star.left}
              y={star.top}
            />
          ))}
        </LineBackdrop>
        <Line
          dataKey="sessions"
          fadeEdges={false}
          glow={{ blur: 5, opacity: 0.85 }}
          highlight={HIGHLIGHT}
          stroke="var(--sunset-line-mid)"
          strokeGradient={LINE_GRADIENT}
          strokeWidth={2}
        />
        <ChartTooltip
          backgroundColor="var(--popover)"
          content={GlowTooltipContent}
          dotColor="var(--sunset-dot)"
          dotHaloBlur={4}
          dotHaloOpacity={0.7}
          dotHaloScale={2.4}
          dotSize={4.5}
          indicatorColor="var(--sunset-dusk)"
          indicatorEnd="point"
          indicatorEndColor="var(--sunset-dot)"
          indicatorFadeEdges="top"
          indicatorFadeLength={35}
          showDatePill={false}
          topOffset={16}
        />
      </LineChart>
    </div>
  );
}
