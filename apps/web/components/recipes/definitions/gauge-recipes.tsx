"use client";

import { Gauge } from "@bklitui/ui/charts";
import { type ReactNode, useEffect, useState } from "react";
import { editableData } from "@/components/charts/editable-data";
import type { Recipe } from "@/lib/recipes/types";

/* -------------------------------------------------------------------------- */
/* Shared card layout                                                         */
/* -------------------------------------------------------------------------- */

const CARD_CLASS =
  "mx-auto flex w-full max-w-sm flex-col gap-3 rounded-xl border bg-card p-4 sm:p-5";

/** Gauge box — the arc keeps its 21:16 aspect inside it. */
const DIAL_CLASS = "mx-auto w-full max-w-[280px]";

const WHOLE = { maximumFractionDigits: 0 } as const;

function GaugeCard({
  title,
  meta,
  stats,
  children,
}: {
  title: string;
  meta: string;
  stats: { label: string; value: string }[];
  children: ReactNode;
}) {
  return (
    <div className={CARD_CLASS}>
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <span className="text-muted-foreground text-xs">{meta}</span>
      </div>
      <div className={DIAL_CLASS}>{children}</div>
      <dl className="grid grid-cols-3 gap-2 border-t pt-3">
        {stats.map((stat) => (
          <div className="flex min-w-0 flex-col gap-0.5" key={stat.label}>
            <dt className="truncate text-muted-foreground text-xs">
              {stat.label}
            </dt>
            <dd className="font-medium text-sm tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const CARD_SOURCE = `function GaugeCard({ title, meta, stats, children }: {
  title: string;
  meta: string;
  stats: { label: string; value: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <span className="text-muted-foreground text-xs">{meta}</span>
      </div>
      <div className="mx-auto w-full max-w-[280px]">{children}</div>
      <dl className="grid grid-cols-3 gap-2 border-t pt-3">
        {stats.map((stat) => (
          <div className="flex min-w-0 flex-col gap-0.5" key={stat.label}>
            <dt className="truncate text-muted-foreground text-xs">{stat.label}</dt>
            <dd className="font-medium text-sm tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}`;

const GAUGE_IMPORT = `import { Gauge } from "@/components/charts/gauge";`;

function gaugeChart(
  Preview: Recipe["charts"][number]["Preview"],
  steps: string[],
  code: string,
  editable?: {
    /** JSON key of the reading, e.g. `{ "speed": 228 }`. */
    key: string;
    initial: number;
    render: (reading: number) => ReactNode;
  }
): Recipe["charts"][number] {
  return {
    id: "gauge",
    label: "Gauge",
    rootComponent: "Gauge",
    Preview,
    install: ["gauge-chart"],
    steps,
    code,
    editableData: editable
      ? editableData({
          data: { [editable.key]: editable.initial },
          render: (data) => editable.render(Number(data[editable.key])),
        })
      : undefined,
  };
}

/* -------------------------------------------------------------------------- */
/* Dashboard dial — fine notches, inside ruler, line needle                   */
/* -------------------------------------------------------------------------- */

function DashboardDial({ rate = 53.3 }: { rate?: number }) {
  return (
    <GaugeCard
      meta="Q3 · 240 closed"
      stats={[
        { label: "Won", value: "128" },
        { label: "Lost", value: "112" },
        { label: "Open", value: "46" },
      ]}
      title="Win rate"
    >
      <Gauge
        centerValue={rate}
        defaultLabel="won vs. lost"
        endAngle={392}
        formatOptions={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        inactiveFillOpacity={0.7}
        minWidth={0}
        needle="line"
        notchCornerRadius={2}
        notchLengthPercent={34}
        ruler
        spacing={40}
        startAngle={148}
        suffix="%"
        totalNotches={72}
        value={rate}
      />
    </GaugeCard>
  );
}

const DASHBOARD_DIAL_SOURCE = `"use client";

${GAUGE_IMPORT}

${CARD_SOURCE}

export function WinRateCard({ won, lost, open }: { won: number; lost: number; open: number }) {
  const rate = (won / (won + lost)) * 100;
  return (
    <GaugeCard
      title="Win rate"
      meta={\`Q3 · \${won + lost} closed\`}
      stats={[
        { label: "Won", value: String(won) },
        { label: "Lost", value: String(lost) },
        { label: "Open", value: String(open) },
      ]}
    >
      <Gauge
        value={rate}
        centerValue={rate}
        defaultLabel="won vs. lost"
        suffix="%"
        formatOptions={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        // Fine, short notches over a 252° sweep
        totalNotches={72}
        spacing={40}
        notchLengthPercent={34}
        notchCornerRadius={2}
        startAngle={148}
        endAngle={392}
        inactiveFillOpacity={0.7}
        // Inside scale that brightens as the fill passes + a line needle
        ruler
        needle="line"
        minWidth={0}
      />
    </GaugeCard>
  );
}
`;

export const gaugeDashboardDial: Recipe = {
  id: "gauge-dashboard-dial",
  title: "Dashboard dial",
  category: "gauges",
  description:
    "A fine-notched dial with an inside ruler and a line needle — the fill sweeps in without bounce and the ticks light up behind it.",
  look: "a compact bordered card titled “Win rate” with the period on the right. In the middle sits an arc gauge of 72 short, slightly rounded notches over a 252° sweep (the gap at the bottom), with a fine tick scale just inside the notches — majors every 10%, minors between — and a thin solid needle pointing at the value. The center shows the percentage with one decimal over a small caption. On mount the track fades in, then the notches, ticks and needle sweep from zero to the value together and settle without overshoot. Under a divider, three small stats (won / lost / open) sit in a row.",
  charts: [
    gaugeChart(
      DashboardDial,
      [
        'Keep `value` on the 0–100 scale (here the win rate %) and pass the same number as `centerValue` with `suffix="%"` and one-decimal `formatOptions`.',
        "Make the notches fine and short: `totalNotches={72} spacing={40} notchLengthPercent={34} notchCornerRadius={2}`, and open the sweep at the bottom with `startAngle={148} endAngle={392}`. Set `inactiveFillOpacity={0.7}` so the track reads behind the scale.",
        'Add `ruler` (inside scale: 50 intervals, majors every 5, ticks brighten up to the value) and `needle="line"` (thin rounded pointer that floats clear of the label).',
        "Don't animate it yourself — the gauge fades its track in, then sweeps the fill, ruler highlight and needle from 0 on a zero-bounce spring, and later value changes continue from the current position. Use `enterTransition` only if the timing must change.",
        "Wrap it in a `max-w-sm` card: header row (title + period), the gauge in a `max-w-[280px]` box with `minWidth={0}`, and a `border-t` row of three small stats.",
      ],
      DASHBOARD_DIAL_SOURCE,
      {
        key: "rate",
        initial: 53.3,
        render: (rate) => <DashboardDial rate={rate} />,
      }
    ),
  ],
};

/* -------------------------------------------------------------------------- */
/* Speedometer — zone fill, glow, progress dots, outside ruler                */
/* -------------------------------------------------------------------------- */

const SPEED_MAX = 260;

function Speedometer({ speed = 228 }: { speed?: number }) {
  return (
    <GaugeCard
      meta="Lap 14"
      stats={[
        { label: "Avg", value: "184 km/h" },
        { label: "Top", value: "241 km/h" },
        { label: "Gear", value: "6" },
      ]}
      title="Speed"
    >
      <Gauge
        activeFill="var(--chart-1)"
        centerValue={speed}
        defaultLabel="km/h"
        dots={{ color: "var(--destructive)", rings: 6 }}
        formatOptions={WHOLE}
        glow
        inactiveFillOpacity={0.25}
        minWidth={0}
        notchCornerRadius={1}
        notchLengthPercent={55}
        ruler={{
          position: "outside",
          ticks: 26,
          majorEvery: 2,
          highlightActive: false,
        }}
        spacing={35}
        totalNotches={90}
        value={(speed / SPEED_MAX) * 100}
        zoneDisplay="fill"
        zones={[{ from: 78, to: 100, color: "var(--destructive)" }]}
      />
    </GaugeCard>
  );
}

const SPEEDOMETER_SOURCE = `"use client";

${GAUGE_IMPORT}

${CARD_SOURCE}

const MAX_SPEED = 260; // km/h at the end of the dial

export function SpeedCard({ speed, avg, top, gear }: { speed: number; avg: number; top: number; gear: number }) {
  return (
    <GaugeCard
      title="Speed"
      meta="Lap 14"
      stats={[
        { label: "Avg", value: \`\${avg} km/h\` },
        { label: "Top", value: \`\${top} km/h\` },
        { label: "Gear", value: String(gear) },
      ]}
    >
      <Gauge
        value={(speed / MAX_SPEED) * 100} // map the reading onto 0–100
        centerValue={speed}
        defaultLabel="km/h"
        formatOptions={{ maximumFractionDigits: 0 }}
        // Dense notches with a soft glow on the lit ones
        totalNotches={90}
        spacing={35}
        notchLengthPercent={55}
        notchCornerRadius={1}
        activeFill="var(--chart-1)"
        inactiveFillOpacity={0.25}
        glow
        // Past 78% the lit notches switch to the red-line colour
        zones={[{ from: 78, to: 100, color: "var(--destructive)" }]}
        zoneDisplay="fill"
        // Outside scale that stays dim, dot rings lighting up inside
        ruler={{ position: "outside", ticks: 26, majorEvery: 2, highlightActive: false }}
        dots={{ color: "var(--destructive)", rings: 6 }}
        minWidth={0}
      />
    </GaugeCard>
  );
}
`;

export const gaugeSpeedometer: Recipe = {
  id: "gauge-speedometer",
  title: "Speedometer",
  category: "gauges",
  description:
    "Dense glowing notches that turn red past the red line, an outside scale and rings of dots lighting up behind the fill.",
  look: "a bordered card titled “Speed”. The dial is a 270° arc of 90 thin notches in the theme's primary chart colour with a soft bloom on the lit ones; the last fifth of the arc is a red-line zone, so lit notches past 78% turn red. A dim tick scale rings the outside (majors every other tick, not highlighted), and inside the arc six rings of small red dots light up to the value, fading toward the center. The center shows the speed (e.g. “228”) over “km/h”. Below a divider: average, top speed and gear.",
  charts: [
    gaugeChart(
      Speedometer,
      [
        'Map the reading onto the 0–100 scale: `value={(speed / MAX_SPEED) * 100}` and show the real number with `centerValue={speed} defaultLabel="km/h"`.',
        'Make the notches dense: `totalNotches={90} spacing={35} notchLengthPercent={55} notchCornerRadius={1}`, `activeFill="var(--chart-1)"`, `inactiveFillOpacity={0.25}`, and add `glow` (soft bloom on the lit notches; tune with `{ blur, intensity }`).',
        'Add the red line: `zones={[{ from: 78, to: 100, color: "var(--destructive)" }]}` with `zoneDisplay="fill"` so lit notches inside the zone take its colour (use `"band"` for a separate arc, `"both"` for both).',
        'Ring the outside with `ruler={{ position: "outside", ticks: 26, majorEvery: 2, highlightActive: false }}` — the track shrinks to make room automatically.',
        'Fill the inside with `dots={{ color: "var(--destructive)", rings: 6 }}` — concentric dot rings that light up to the value.',
        "Place it in a `max-w-sm` card with a header, the gauge in a `max-w-[280px]` box (`minWidth={0}`) and a three-stat row under a `border-t`.",
      ],
      SPEEDOMETER_SOURCE,
      {
        key: "speed",
        initial: 228,
        render: (speed) => <Speedometer speed={speed} />,
      }
    ),
  ],
};

/* -------------------------------------------------------------------------- */
/* Conic KPI dial — sector, progress ring, labelled ruler, center disc        */
/* -------------------------------------------------------------------------- */

const TONNES_MAX = 800;

function ConicKpiDial({ tonnes = 518 }: { tonnes?: number }) {
  return (
    <GaugeCard
      meta="Plant 2 · today"
      stats={[
        { label: "Target", value: "600 t" },
        { label: "Yesterday", value: "487 t" },
        { label: "Change", value: "+6.4%" },
      ]}
      title="Throughput"
    >
      <Gauge
        arcStyle="none"
        centerDisc
        centerValue={tonnes}
        defaultLabel="t / day"
        formatOptions={WHOLE}
        minWidth={0}
        needle={{ variant: "triangle", tip: "outer", length: 0.62, width: 8 }}
        progressRing={{ color: "var(--chart-1)" }}
        ruler={{
          ticks: 16,
          majorEvery: 2,
          labels: { min: 0, max: TONNES_MAX },
        }}
        sector={{ color: "var(--chart-1)" }}
        value={(tonnes / TONNES_MAX) * 100}
      />
    </GaugeCard>
  );
}

const CONIC_KPI_SOURCE = `"use client";

${GAUGE_IMPORT}

${CARD_SOURCE}

const CAPACITY = 800; // tonnes per day at the end of the dial

export function ThroughputCard({ tonnes, target, yesterday }: { tonnes: number; target: number; yesterday: number }) {
  const change = ((tonnes - yesterday) / yesterday) * 100;
  return (
    <GaugeCard
      title="Throughput"
      meta="Plant 2 · today"
      stats={[
        { label: "Target", value: \`\${target} t\` },
        { label: "Yesterday", value: \`\${yesterday} t\` },
        { label: "Change", value: \`\${change >= 0 ? "+" : ""}\${change.toFixed(1)}%\` },
      ]}
    >
      <Gauge
        value={(tonnes / CAPACITY) * 100}
        centerValue={tonnes}
        defaultLabel="t / day"
        formatOptions={{ maximumFractionDigits: 0 }}
        arcStyle="none" // no track — the sector carries the value
        sector={{ color: "var(--chart-1)" }} // conic wedge, brightest at the value
        progressRing={{ color: "var(--chart-1)" }}
        ruler={{ ticks: 16, majorEvery: 2, labels: { min: 0, max: CAPACITY } }}
        needle={{ variant: "triangle", tip: "outer", length: 0.62, width: 8 }}
        centerDisc // ringed disc behind the readout; the sector starts at its edge
        minWidth={0}
      />
    </GaugeCard>
  );
}
`;

export const gaugeConicKpi: Recipe = {
  id: "gauge-conic-kpi",
  title: "Conic sector KPI dial",
  category: "gauges",
  description:
    "No track — a conic wedge brightens toward the value, framed by a thin progress ring, a scale labelled in real units and a ringed center disc.",
  look: "a bordered card titled “Throughput” with the site and day on the right. The dial has no notches: a wedge filled with a conic gradient sweeps from the start of the arc to the value, transparent at the start and brightest at its leading edge, starting at the edge of a dark ringed disc in the center that holds the readout (“518” over “t / day”). A thin progress ring traces the value around the outside with the remainder faint, an inside tick scale is labelled 0 … 800 at every major tick, and a slim triangle needle reaches the outer edge. Below a divider: target, yesterday and change.",
  charts: [
    gaugeChart(
      ConicKpiDial,
      [
        "Map the KPI onto 0–100 (`value={(tonnes / CAPACITY) * 100}`) and show the real number in `centerValue` with a unit caption in `defaultLabel`.",
        'Drop the track with `arcStyle="none"` and add `sector={{ color: "var(--chart-1)" }}` — a conic wedge from the start angle to the value (`gradient: "radial"` or `"none"` for other fills).',
        'Trace the value with `progressRing={{ color: "var(--chart-1)" }}` and label the scale in real units: `ruler={{ ticks: 16, majorEvery: 2, labels: { min: 0, max: CAPACITY } }}`.',
        'Point at it with `needle={{ variant: "triangle", tip: "outer", length: 0.62, width: 8 }}` and add `centerDisc` — the sector snaps to the disc\'s edge so the readout sits on a clean surface.',
        "Use the shared card: header, gauge in a `max-w-[280px]` box (`minWidth={0}`), three stats under a `border-t`.",
      ],
      CONIC_KPI_SOURCE,
      {
        key: "tonnes",
        initial: 518,
        render: (tonnes) => <ConicKpiDial tonnes={tonnes} />,
      }
    ),
  ],
};

/* -------------------------------------------------------------------------- */
/* Fan duty — solid arc, outside ruler, red zone band, short needle           */
/* -------------------------------------------------------------------------- */

function FanDutyGauge({ duty = 72 }: { duty?: number }) {
  return (
    <GaugeCard
      meta="Rack B · auto"
      stats={[
        { label: "Speed", value: "3,240 rpm" },
        { label: "Inlet", value: "41 °C" },
        { label: "Limit", value: "80%" },
      ]}
      title="Fan duty"
    >
      <Gauge
        activeFill="var(--foreground)"
        arcStyle="solid"
        centerValue={duty}
        defaultLabel="Duty %"
        formatOptions={WHOLE}
        inactiveFillOpacity={0.6}
        minWidth={0}
        needle={{ variant: "line", length: 0.22, width: 5 }}
        ruler={{
          position: "outside",
          ticks: 20,
          majorEvery: 5,
          labels: "ends",
        }}
        value={duty}
        zones={[{ from: 80, to: 100, color: "var(--destructive)" }]}
      />
    </GaugeCard>
  );
}

const FAN_DUTY_SOURCE = `"use client";

${GAUGE_IMPORT}

${CARD_SOURCE}

export function FanDutyCard({ duty, rpm, inlet }: { duty: number; rpm: number; inlet: number }) {
  return (
    <GaugeCard
      title="Fan duty"
      meta="Rack B · auto"
      stats={[
        { label: "Speed", value: \`\${rpm.toLocaleString()} rpm\` },
        { label: "Inlet", value: \`\${inlet} °C\` },
        { label: "Limit", value: "80%" },
      ]}
    >
      <Gauge
        value={duty}
        centerValue={duty}
        defaultLabel="Duty %"
        formatOptions={{ maximumFractionDigits: 0 }}
        arcStyle="solid" // one rounded stroke instead of notches
        activeFill="var(--foreground)"
        inactiveFillOpacity={0.6}
        ruler={{ position: "outside", ticks: 20, majorEvery: 5, labels: "ends" }}
        zones={[{ from: 80, to: 100, color: "var(--destructive)" }]} // red band past the limit
        needle={{ variant: "line", length: 0.22, width: 5 }} // short stub just inside the arc
        minWidth={0}
      />
    </GaugeCard>
  );
}
`;

export const gaugeFanDuty: Recipe = {
  id: "gauge-fan-duty",
  title: "Solid fan duty gauge",
  category: "gauges",
  description:
    "An instrument-style dial: one rounded solid arc, an outside scale with end labels, a red band past the limit and a short stub needle.",
  look: "a bordered card titled “Fan duty”. The dial is a single thick rounded arc — the filled part in the foreground colour, the rest a muted track — with a fine tick scale ringing the outside (majors every quarter) labelled only “0” and “100” at the ends. A thin red band marks 80–100% just outside the arc. A short, thick stub needle sits just inside the arc at the value rather than reaching the center, and the center reads “72” over “Duty %”. Below a divider: fan speed, inlet temperature and the limit.",
  charts: [
    gaugeChart(
      FanDutyGauge,
      [
        'Switch the track to one rounded stroke with `arcStyle="solid"` (thickness via `arcThickness`, default `0.035` of the gauge size); colour it with `activeFill="var(--foreground)"` and `inactiveFillOpacity={0.6}`.',
        'Ring it with an outside scale labelled at the ends: `ruler={{ position: "outside", ticks: 20, majorEvery: 5, labels: "ends" }}`.',
        'Mark the limit with `zones={[{ from: 80, to: 100, color: "var(--destructive)" }]}` — the default `zoneDisplay="band"` draws a thin arc outside the track.',
        'Add a short stub needle near the arc: `needle={{ variant: "line", length: 0.22, width: 5 }}` (`length` is a fraction of the reach, so 0.22 keeps it clear of the label).',
        "Use the shared card with fan speed, inlet temperature and limit as stats.",
      ],
      FAN_DUTY_SOURCE,
      {
        key: "duty",
        initial: 72,
        render: (duty) => <FanDutyGauge duty={duty} />,
      }
    ),
  ],
};

/* -------------------------------------------------------------------------- */
/* Uptime dots — dots + progress ring, no track                               */
/* -------------------------------------------------------------------------- */

function UptimeDots() {
  return (
    <GaugeCard
      meta="Last 30 days"
      stats={[
        { label: "Incidents", value: "3" },
        { label: "MTTR", value: "18 min" },
        { label: "SLA", value: "99.9%" },
      ]}
      title="Uptime score"
    >
      <Gauge
        arcStyle="none"
        centerValue={83}
        defaultLabel="health score"
        dots={{ rings: 7, spacing: 0.032, radius: 2.2 }}
        formatOptions={WHOLE}
        minWidth={0}
        progressRing
        value={83}
      />
    </GaugeCard>
  );
}

const UPTIME_DOTS_SOURCE = `"use client";

${GAUGE_IMPORT}

${CARD_SOURCE}

export function UptimeCard({ score, incidents, mttr }: { score: number; incidents: number; mttr: number }) {
  return (
    <GaugeCard
      title="Uptime score"
      meta="Last 30 days"
      stats={[
        { label: "Incidents", value: String(incidents) },
        { label: "MTTR", value: \`\${mttr} min\` },
        { label: "SLA", value: "99.9%" },
      ]}
    >
      <Gauge
        value={score}
        centerValue={score}
        defaultLabel="health score"
        formatOptions={{ maximumFractionDigits: 0 }}
        arcStyle="none" // dots only — no notches
        dots={{ rings: 7, spacing: 0.032, radius: 2.2 }}
        progressRing // thin ring anchoring the sweep
        minWidth={0}
      />
    </GaugeCard>
  );
}
`;

export const gaugeUptimeDots: Recipe = {
  id: "gauge-uptime-dots",
  title: "Progress dots uptime",
  category: "gauges",
  description:
    "A dot-matrix dial: seven rings of dots light up to the score, fading toward the center, with a thin progress ring around them.",
  look: "a bordered card titled “Uptime score” with the period on the right. The dial has no notches — instead seven concentric arcs of small dots fill the gauge, lit in the primary chart colour up to the value and faint beyond it, each ring a little dimmer toward the center. A thin progress ring runs around the outside (value in colour, remainder faint). The center shows the score (“83”) over “health score”. Below a divider: incidents, MTTR and SLA.",
  charts: [
    gaugeChart(
      UptimeDots,
      [
        'Remove the notch track with `arcStyle="none"`.',
        "Add `dots={{ rings: 7, spacing: 0.032, radius: 2.2 }}` — concentric dot rings that light up to the value; `color`, `dimOpacity`, `litOpacity` and `fadeInward` tune the look (defaults `var(--chart-1)`, 0.12, 0.9, true).",
        "Anchor the sweep with `progressRing` (thin value ring; `{ color, trackColor, width, gap }` to customise).",
        "Keep `value` and `centerValue` as the 0–100 score and use the shared card with incidents, MTTR and SLA stats.",
      ],
      UPTIME_DOTS_SOURCE
    ),
  ],
};

/* -------------------------------------------------------------------------- */
/* Live load dial — zones (both), gradient needle, ticking value              */
/* -------------------------------------------------------------------------- */

const LOAD_SAMPLES = [42, 58, 71, 64, 88, 93, 76, 55, 47, 62, 81, 69];
const LOAD_TICK_MS = 1800;

const LOAD_ZONES = [
  { from: 0, to: 60, color: "var(--chart-1)" },
  { from: 60, to: 85, color: "var(--chart-2)" },
  { from: 85, to: 100, color: "var(--destructive)" },
];

function LiveLoadDial() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), LOAD_TICK_MS);
    return () => window.clearInterval(id);
  }, []);
  const load = LOAD_SAMPLES[tick % LOAD_SAMPLES.length] ?? 0;
  const seen = LOAD_SAMPLES.slice(0, Math.min(tick + 1, LOAD_SAMPLES.length));
  const peak = Math.max(...seen);
  const avg = Math.round(seen.reduce((s, v) => s + v, 0) / seen.length);

  return (
    <GaugeCard
      meta="api-03 · live"
      stats={[
        { label: "Now", value: `${load}%` },
        { label: "Avg", value: `${avg}%` },
        { label: "Peak", value: `${peak}%` },
      ]}
      title="CPU load"
    >
      <Gauge
        arcStyle="solid"
        arcThickness={0.05}
        centerValue={load}
        defaultLabel="CPU"
        formatOptions={WHOLE}
        inactiveFillOpacity={0.5}
        minWidth={0}
        needle={{ variant: "gradient", tip: "outer", length: 0.5 }}
        suffix="%"
        value={load}
        zoneDisplay="both"
        zones={LOAD_ZONES}
      />
    </GaugeCard>
  );
}

const LIVE_LOAD_SOURCE = `"use client";

${GAUGE_IMPORT}

${CARD_SOURCE}

const zones = [
  { from: 0, to: 60, color: "var(--chart-1)" }, // healthy
  { from: 60, to: 85, color: "var(--chart-2)" }, // warm
  { from: 85, to: 100, color: "var(--destructive)" }, // hot
];

/** \`load\` is the latest sample (0–100); pass a new one whenever it arrives. */
export function CpuLoadCard({ load, avg, peak }: { load: number; avg: number; peak: number }) {
  return (
    <GaugeCard
      title="CPU load"
      meta="api-03 · live"
      stats={[
        { label: "Now", value: \`\${load}%\` },
        { label: "Avg", value: \`\${avg}%\` },
        { label: "Peak", value: \`\${peak}%\` },
      ]}
    >
      {/* Each new value sweeps on from the current position — no remount, no restart */}
      <Gauge
        value={load}
        centerValue={load}
        defaultLabel="CPU"
        suffix="%"
        formatOptions={{ maximumFractionDigits: 0 }}
        arcStyle="solid"
        arcThickness={0.05}
        inactiveFillOpacity={0.5}
        zones={zones}
        zoneDisplay="both" // band outside + the fill takes the zone colour
        needle={{ variant: "gradient", tip: "outer", length: 0.5 }}
        minWidth={0}
      />
    </GaugeCard>
  );
}
`;

export const gaugeLiveLoad: Recipe = {
  id: "gauge-live-load",
  title: "Live load dial",
  category: "gauges",
  description:
    "A solid arc with traffic-light zones that re-sweeps from where it is each time a new sample arrives.",
  look: "a bordered card titled “CPU load” with the host and “live” on the right. The dial is one thick rounded arc whose fill takes the colour of the zone it is in — primary up to 60%, yellow to 85%, red beyond — with matching thin zone bands ringing the outside. A tapered needle that fades in toward its tip reaches the arc's outer edge. The center reads the current load (“71%”) over “CPU”. Every couple of seconds a new sample arrives and the fill, zone colours and needle glide from their current position to the new value without bouncing or restarting from zero. Below a divider: now, average and peak.",
  charts: [
    gaugeChart(
      LiveLoadDial,
      [
        'Use a thick solid arc: `arcStyle="solid" arcThickness={0.05} inactiveFillOpacity={0.5}`.',
        'Define traffic-light zones on 0–100 — `[{ from: 0, to: 60, color: "var(--chart-1)" }, { from: 60, to: 85, color: "var(--chart-2)" }, { from: 85, to: 100, color: "var(--destructive)" }]` — and pass them with `zoneDisplay="both"` so the fill recolours inside each zone and bands ring the track.',
        'Add `needle={{ variant: "gradient", tip: "outer", length: 0.5 }}` so the tapered needle reaches the arc\'s outer edge.',
        "Feed live samples straight into `value` / `centerValue` — don't change `key` or remount. The gauge continues each sweep from its current position with a zero-bounce spring (and jumps instantly under reduced motion).",
        "Use the shared card with now / average / peak stats.",
      ],
      LIVE_LOAD_SOURCE
    ),
  ],
};
