"use client";

import {
  RadialArea,
  RadialAxis,
  RadialCenter,
  RadialChart,
  RadialDotBar,
  RadialLegend,
  RadialLine,
  RadialRingBar,
  RadialScrubber,
  type RadialSeries,
} from "@bklitui/ui/charts";
import { useMemo, useState } from "react";
import { sfTemperatureData } from "@/components/charts/radial/sf-temperature-data";
import {
  nowBinIndex,
  useLocalNow,
} from "@/components/charts/radial/use-local-now";
import type { Recipe } from "@/lib/recipes/types";
import { recipeCafeHours, recipeStoragePlan } from "../recipe-data";

const CARD_CLASS =
  "mx-auto flex w-full flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5";

const count = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/* -------------------------------------------------------------------------- */
/* 24h activity card                                                          */
/* -------------------------------------------------------------------------- */

const cafeSeries: RadialSeries[] = [
  { dataKey: "dineIn", label: "Dine in", color: "var(--chart-1)" },
  { dataKey: "takeaway", label: "Takeaway", color: "var(--chart-3)" },
];

interface CafeHour extends Record<string, unknown> {
  time: string;
  /** Cups (null for hours still to come today) */
  dineIn: number | null;
  takeaway: number | null;
}

/** Fixed dot scale (the full day's peak) so columns don't rescale as the day fills in. */
const CAFE_MAX_CUPS = Math.max(
  ...recipeCafeHours.map((h) => h.dineIn + h.takeaway)
);

function cups(h: CafeHour): number {
  return (h.dineIn ?? 0) + (h.takeaway ?? 0);
}

/** Today's hours up to `nowHour` (inclusive); later hours are null. */
function cafeHoursUntil(nowHour: number): CafeHour[] {
  return recipeCafeHours.map((h, index) =>
    index <= nowHour ? h : { time: h.time, dineIn: null, takeaway: null }
  );
}

function nextHour(time: string): string {
  const hour = (Number.parseInt(time, 10) + 1) % 24;
  return `${String(hour).padStart(2, "0")}:00`;
}

function StatRow({
  color,
  label,
  value,
}: {
  color?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {color ? (
        <span
          aria-hidden
          className="size-2 shrink-0 rounded-full"
          style={{ background: color }}
        />
      ) : null}
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function ActivityClockCard() {
  const [hovered, setHovered] = useState<number | null>(null);
  const { minuteOfDay } = useLocalNow();
  const nowHour = nowBinIndex(minuteOfDay, 24);
  const { hours, totals, busiest } = useMemo(() => {
    const today = cafeHoursUntil(nowHour);
    const sold = today.slice(0, nowHour + 1);
    return {
      hours: today,
      totals: sold.reduce(
        (sum, h) => ({
          dineIn: sum.dineIn + (h.dineIn ?? 0),
          takeaway: sum.takeaway + (h.takeaway ?? 0),
        }),
        { dineIn: 0, takeaway: 0 }
      ),
      busiest: sold.reduce((best, h) => (cups(h) > cups(best) ? h : best)),
    };
  }, [nowHour]);

  const hour = hovered === null ? null : (hours[hovered] ?? null);
  const isLater = hovered !== null && hovered > nowHour;
  const dineIn = hour ? (hour.dineIn ?? 0) : totals.dineIn;
  const takeaway = hour ? (hour.takeaway ?? 0) : totals.takeaway;
  const total = dineIn + takeaway;
  const busiestCups = cups(busiest);

  let caption = "cups sold today";
  if (hour) {
    caption = `cups ${hour.time}–${nextHour(hour.time)}${isLater ? " · later today" : ""}`;
  }

  return (
    <div className={`${CARD_CLASS} max-w-xl`}>
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-medium text-sm">Orders today</h4>
        <span className="text-muted-foreground text-xs">Open 06:00–20:00</span>
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <div className="w-full max-w-[200px] shrink-0 sm:max-w-[220px]">
          <RadialChart
            data={hours}
            hoveredIndex={hovered}
            onHoverChange={setHovered}
            series={cafeSeries}
            xDataKey="time"
          >
            <RadialAxis />
            <RadialDotBar
              dotSize={0.9}
              layout="columns"
              maxValue={CAFE_MAX_CUPS}
              patterns={{ takeaway: { preset: "diagonal", strokeWidth: 1.5 } }}
              rows={5}
            />
            <RadialScrubber rest="hidden" variant="dashed" />
          </RadialChart>
        </div>
        <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
          <div>
            <div className="font-semibold text-3xl tabular-nums tracking-tight">
              {isLater ? "–" : count.format(total)}
            </div>
            <div className="text-muted-foreground text-xs">{caption}</div>
          </div>
          <div className="flex flex-col gap-1.5 border-t pt-3">
            <StatRow
              color="var(--chart-1)"
              label="Dine in"
              value={isLater ? "–" : count.format(dineIn)}
            />
            <StatRow
              color="var(--chart-3)"
              label="Takeaway"
              value={isLater ? "–" : count.format(takeaway)}
            />
            <StatRow
              label="Busiest hour"
              value={
                busiestCups > 0 ? `${busiest.time} · ${busiestCups} cups` : "–"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const ACTIVITY_SOURCE = `"use client";

import { useState } from "react";
import { RadialAxis } from "@/components/charts/radial-axis";
import { RadialChart } from "@/components/charts/radial-chart";
import { RadialDotBar } from "@/components/charts/radial-dot-bar";
import { RadialScrubber } from "@/components/charts/radial-scrubber";

interface Hour {
  time: string; // "00:00" … "23:00"
  dineIn: number | null; // null for hours still to come today
  takeaway: number | null;
}

const series = [
  { dataKey: "dineIn", label: "Dine in", color: "var(--chart-1)" },
  { dataKey: "takeaway", label: "Takeaway", color: "var(--chart-3)" },
];

const count = new Intl.NumberFormat("en-US");

const cups = (h: Hour) => (h.dineIn ?? 0) + (h.takeaway ?? 0);

const nextHour = (time: string) =>
  \`\${String((Number.parseInt(time, 10) + 1) % 24).padStart(2, "0")}:00\`;

function StatRow({ color, label, value }: { color?: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {color ? <span className="size-2 shrink-0 rounded-full" style={{ background: color }} /> : null}
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

export function OrdersTodayCard({ hours }: { hours: Hour[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const hour = hovered === null ? null : hours[hovered];
  const totals = hours.reduce(
    (sum, h) => ({
      dineIn: sum.dineIn + (h.dineIn ?? 0),
      takeaway: sum.takeaway + (h.takeaway ?? 0),
    }),
    { dineIn: 0, takeaway: 0 }
  );
  const busiest = hours.reduce((best, h) => (cups(h) > cups(best) ? h : best));
  const counts = hour
    ? { dineIn: hour.dineIn ?? 0, takeaway: hour.takeaway ?? 0 }
    : totals;

  return (
    <div className="flex w-full max-w-xl flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-medium text-sm">Orders today</h4>
        <span className="text-muted-foreground text-xs">Open 06:00–20:00</span>
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <div className="w-full max-w-[200px] shrink-0 sm:max-w-[220px]">
          <RadialChart
            data={hours}
            xDataKey="time"
            series={series}
            hoveredIndex={hovered}
            onHoverChange={setHovered}
          >
            <RadialAxis />
            <RadialDotBar
              layout="columns"
              rows={5}
              dotSize={0.9}
              patterns={{ takeaway: { preset: "diagonal", strokeWidth: 1.5 } }}
            />
            <RadialScrubber rest="hidden" variant="dashed" />
          </RadialChart>
        </div>
        <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
          <div>
            <div className="font-semibold text-3xl tabular-nums tracking-tight">
              {count.format(counts.dineIn + counts.takeaway)}
            </div>
            <div className="text-muted-foreground text-xs">
              {hour ? \`cups \${hour.time}–\${nextHour(hour.time)}\` : "cups sold today"}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 border-t pt-3">
            <StatRow color="var(--chart-1)" label="Dine in" value={count.format(counts.dineIn)} />
            <StatRow color="var(--chart-3)" label="Takeaway" value={count.format(counts.takeaway)} />
            <StatRow
              label="Busiest hour"
              value={cups(busiest) ? \`\${busiest.time} · \${cups(busiest)} cups\` : "–"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
`;

export const activityClockCard: Recipe = {
  id: "activity-clock-card",
  title: "24h activity card",
  category: "radial",
  description:
    "A dashboard card with a 24-hour dot clock beside its numbers — hover an hour and the stats follow.",
  look: "a bordered card titled “Orders today” with opening hours on the right. On the left sits a small 24-hour radial clock: one column of five large dots per hour, solid for dine-in and diagonally striped for takeaway, with a scrubber that appears on hover. On the right, a big physical count (cups sold today) with a caption, then a divider and rows for each series with a colour dot, plus the busiest hour. Hovering the clock swaps every number to that hour (caption reads e.g. “cups 08:00–09:00”).",
  charts: [
    {
      id: "radial",
      label: "Radial",
      rootComponent: "RadialChart",
      Preview: ActivityClockCard,
      install: ["radial-chart"],
      steps: [
        'Give the clock 24 hourly bins (`time: "00:00"` … `"23:00"`) and one series per stacked count, colored `var(--chart-1)` / `var(--chart-3)`.',
        "Lift hover into the card: `const [hovered, setHovered] = useState<number | null>(null)` and pass `hoveredIndex={hovered}` / `onHoverChange={setHovered}` to `<RadialChart>`.",
        'Draw `<RadialAxis />`, `<RadialDotBar layout="columns" rows={5} dotSize={0.9} patterns={{ takeaway: { preset: "diagonal", strokeWidth: 1.5 } }} />` and `<RadialScrubber rest="hidden" variant="dashed" />`. Leave out `RadialCenter` and `RadialLegend` — the card shows the numbers.',
        "Lay the card out as a header row, then a flex row (column on mobile) with the chart in a `max-w-[220px]` box and a stats column: a big count (`text-3xl tabular-nums`) with a caption, a `border-t` divider and one row per series (colour dot, label, value) plus the busiest hour.",
        "Read `hours[hovered]` when hovered, else the day's totals, so every number and the caption switch together.",
        "For a live “today” card, set hours after the current local hour to `null` — the clock stops at now and the totals and busiest hour only count what's been sold.",
      ],
      code: ACTIVITY_SOURCE,
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Storage usage card                                                         */
/* -------------------------------------------------------------------------- */

const storageSeries: RadialSeries[] = [
  { dataKey: "photos", label: "Photos", color: "var(--chart-1)" },
  { dataKey: "backups", label: "Backups", color: "var(--chart-2)" },
  { dataKey: "documents", label: "Documents", color: "var(--chart-3)" },
  { dataKey: "mail", label: "Mail", color: "var(--chart-4)" },
];

const storageData = [{ plan: "Cloud", ...recipeStoragePlan.used }];

const storageUsed = Object.values(recipeStoragePlan.used).reduce(
  (sum, v) => sum + v,
  0
);

function formatStorage(gb: number): string {
  return gb >= 1024 ? `${(gb / 1024).toFixed(1)} TB` : `${count.format(gb)} GB`;
}

function StorageUsageCard() {
  const { capacity } = recipeStoragePlan;
  return (
    <div className={`${CARD_CLASS} max-w-sm`}>
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-medium text-sm">Cloud storage</h4>
        <span className="text-muted-foreground text-xs">
          {formatStorage(capacity)} plan
        </span>
      </div>
      <RadialChart
        data={storageData}
        endAngle={90}
        layout={{ center: 0.62, bandInner: 0.66, bandOuter: 0.9 }}
        maxValue={capacity}
        orientation="angular"
        ringGap={0}
        series={storageSeries}
        startAngle={-90}
        xDataKey="plan"
      >
        <RadialRingBar cornerRadius={4} segmentGap={3} />
        <RadialCenter className="-translate-y-[22%]">
          {() => (
            <>
              <span className="font-bold text-[clamp(1.25rem,15cqw,2.25rem)] tabular-nums leading-none tracking-tight">
                {formatStorage(storageUsed)}
              </span>
              <span className="mt-[2cqw] text-[clamp(0.625rem,6cqw,0.875rem)] text-muted-foreground">
                of {formatStorage(capacity)} used ·{" "}
                {formatStorage(capacity - storageUsed)} free
              </span>
            </>
          )}
        </RadialCenter>
        <RadialLegend className="mt-4" formatValue={formatStorage} />
      </RadialChart>
    </div>
  );
}

const STORAGE_SOURCE = `"use client";

import { RadialCenter } from "@/components/charts/radial-center";
import { RadialChart } from "@/components/charts/radial-chart";
import { RadialLegend } from "@/components/charts/radial-legend";
import { RadialRingBar } from "@/components/charts/radial-ring-bar";

const series = [
  { dataKey: "photos", label: "Photos", color: "var(--chart-1)" },
  { dataKey: "backups", label: "Backups", color: "var(--chart-2)" },
  { dataKey: "documents", label: "Documents", color: "var(--chart-3)" },
  { dataKey: "mail", label: "Mail", color: "var(--chart-4)" },
];

const count = new Intl.NumberFormat("en-US");

const formatStorage = (gb: number) =>
  gb >= 1024 ? \`\${(gb / 1024).toFixed(1)} TB\` : \`\${count.format(gb)} GB\`;

export function StorageCard({
  capacity, // GB, e.g. 2048
  used, // GB per content type, e.g. { photos: 846, backups: 312, documents: 188, mail: 64 }
}: {
  capacity: number;
  used: Record<string, number>;
}) {
  const total = Object.values(used).reduce((sum, v) => sum + v, 0);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-medium text-sm">Cloud storage</h4>
        <span className="text-muted-foreground text-xs">{formatStorage(capacity)} plan</span>
      </div>
      {/* One datum = one ring; content types stack end to end along the half circle */}
      <RadialChart
        data={[{ plan: "Cloud", ...used }]}
        xDataKey="plan"
        series={series}
        orientation="angular"
        startAngle={-90}
        endAngle={90}
        maxValue={capacity}
        ringGap={0}
        layout={{ center: 0.62, bandInner: 0.66, bandOuter: 0.9 }}
      >
        <RadialRingBar cornerRadius={4} segmentGap={3} />
        {/* The hole sits on the arc's center: lift the text into the half disc */}
        <RadialCenter className="-translate-y-[22%]">
          {() => (
            <>
              <span className="font-bold text-[clamp(1.25rem,15cqw,2.25rem)] tabular-nums leading-none tracking-tight">
                {formatStorage(total)}
              </span>
              <span className="mt-[2cqw] text-[clamp(0.625rem,6cqw,0.875rem)] text-muted-foreground">
                of {formatStorage(capacity)} used · {formatStorage(capacity - total)} free
              </span>
            </>
          )}
        </RadialCenter>
        <RadialLegend className="mt-4" formatValue={formatStorage} />
      </RadialChart>
    </div>
  );
}
`;

export const storageUsageCard: Recipe = {
  id: "storage-usage-card",
  title: "Storage usage card",
  category: "radial",
  description:
    "A half-circle gauge for a storage plan — content types stacked along the arc, free space as the faint track.",
  look: "a compact bordered card titled “Cloud storage” with the plan size on the right. Below, one thick semicircular ring: photos, backups, documents and mail stacked end to end along the arc in palette colours with rounded ends, and the unused part of the plan shown as a faint track. Inside the half disc sits the amount used in large type (e.g. “1.4 TB”) over “of 2.0 TB used · 0.6 TB free”. A legend underneath lists each content type with its size; hovering an item isolates that segment.",
  charts: [
    {
      id: "radial",
      label: "Radial",
      rootComponent: "RadialChart",
      Preview: StorageUsageCard,
      install: ["radial-chart"],
      steps: [
        "Pass a single datum (one ring) whose keys are the content types in GB, with one series per type colored `var(--chart-1…4)`.",
        'Make it a semicircle gauge: `orientation="angular" startAngle={-90} endAngle={90}`, `maxValue={capacity}` so the arc end is the plan size, `ringGap={0}` and `layout={{ center: 0.62, bandInner: 0.66, bandOuter: 0.9 }}` for one thick ring.',
        "Draw `<RadialRingBar cornerRadius={4} segmentGap={3} />` — its default track paints the free space.",
        'Add a `<RadialCenter className="-translate-y-[22%]">` render function with the used amount (large, `tabular-nums`) over “of X used · Y free”, and `<RadialLegend className="mt-4" formatValue={formatStorage} />` for per-type sizes.',
        "Format sizes as GB below 1 TB and `x.x TB` above, and wrap it all in a `max-w-sm` card with a header row.",
      ],
      code: STORAGE_SOURCE,
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Seasonal temperature card                                                  */
/* -------------------------------------------------------------------------- */

const temperatureSeries: RadialSeries[] = [
  { dataKey: "avg", label: "Daily average", color: "var(--chart-1)" },
];

const dayFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const annual = {
  avg:
    sfTemperatureData.reduce((sum, d) => sum + d.avg, 0) /
    sfTemperatureData.length,
  min: Math.min(...sfTemperatureData.map((d) => d.min)),
  max: Math.max(...sfTemperatureData.map((d) => d.max)),
  minmin: Math.min(...sfTemperatureData.map((d) => d.minmin)),
  maxmax: Math.max(...sfTemperatureData.map((d) => d.maxmax)),
};

function TemperatureRange({
  label,
  low,
  high,
  opacity,
}: {
  label: string;
  low: number;
  high: number;
  opacity: number;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        aria-hidden
        className="h-2 w-3 shrink-0 rounded-sm"
        style={{ background: "var(--chart-1)", opacity }}
      />
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">
        {Math.round(low)}–{Math.round(high)}°F
      </span>
    </div>
  );
}

function SeasonalTemperatureCard() {
  const [hovered, setHovered] = useState<number | null>(null);
  const day = hovered === null ? null : sfTemperatureData[hovered];
  const stats = day ?? annual;

  return (
    <div className={`${CARD_CLASS} max-w-xl`}>
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-medium text-sm">San Francisco (SFO)</h4>
        <span className="text-muted-foreground text-xs">1999–2018</span>
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <div className="w-full max-w-[220px] shrink-0 sm:max-w-[240px]">
          <RadialChart
            angleType="time"
            data={sfTemperatureData}
            hoveredIndex={hovered}
            maxValue="auto"
            minValue="auto"
            niceValues={false}
            onHoverChange={setHovered}
            series={temperatureSeries}
            valueKeys={["minmin", "maxmax"]}
            xDataKey="date"
          >
            <RadialAxis showCircle={false} showValueLabels={false} />
            <RadialArea
              baseDataKey="minmin"
              color="var(--chart-1)"
              curve="linear"
              dataKey="maxmax"
              fillOpacity={0.14}
              rampFrom={1}
              stroke="none"
            />
            <RadialArea
              baseDataKey="min"
              color="var(--chart-1)"
              curve="linear"
              dataKey="max"
              fillOpacity={0.3}
              rampFrom={1}
              stroke="none"
            />
            <RadialLine dataKey="avg" strokeWidth={1.5} />
            <RadialScrubber variant="gradient" />
          </RadialChart>
        </div>
        <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
          <div>
            <div className="font-semibold text-3xl tabular-nums tracking-tight">
              {stats.avg.toFixed(1)}°F
            </div>
            <div className="text-muted-foreground text-xs">
              {day
                ? `average on ${dayFormat.format(day.date)}`
                : "annual average"}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 border-t pt-3">
            <TemperatureRange
              high={stats.max}
              label={day ? "Normal low–high" : "Normal range"}
              low={stats.min}
              opacity={0.45}
            />
            <TemperatureRange
              high={stats.maxmax}
              label="Record low–high"
              low={stats.minmin}
              opacity={0.2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const TEMPERATURE_SOURCE = `"use client";

import { useState } from "react";
import { RadialArea } from "@/components/charts/radial-area";
import { RadialAxis } from "@/components/charts/radial-axis";
import { RadialChart } from "@/components/charts/radial-chart";
import { RadialLine } from "@/components/charts/radial-line";
import { RadialScrubber } from "@/components/charts/radial-scrubber";

interface Day {
  date: number; // UTC ms, one per day of a (leap) year
  avg: number; // mean daily average, °F
  min: number; // mean daily low
  max: number; // mean daily high
  minmin: number; // record low
  maxmax: number; // record high
}

const series = [{ dataKey: "avg", label: "Daily average", color: "var(--chart-1)" }];

const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function TemperatureRange({ label, low, high, opacity }: { label: string; low: number; high: number; opacity: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="h-2 w-3 shrink-0 rounded-sm" style={{ background: "var(--chart-1)", opacity }} />
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">
        {Math.round(low)}–{Math.round(high)}°F
      </span>
    </div>
  );
}

export function SeasonalTemperatureCard({ days }: { days: Day[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const day = hovered === null ? null : days[hovered];
  const annual = {
    avg: days.reduce((sum, d) => sum + d.avg, 0) / days.length,
    min: Math.min(...days.map((d) => d.min)),
    max: Math.max(...days.map((d) => d.max)),
    minmin: Math.min(...days.map((d) => d.minmin)),
    maxmax: Math.max(...days.map((d) => d.maxmax)),
  };
  const stats = day ?? annual;

  return (
    <div className="flex w-full max-w-xl flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-medium text-sm">San Francisco (SFO)</h4>
        <span className="text-muted-foreground text-xs">1999–2018</span>
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <div className="w-full max-w-[220px] shrink-0 sm:max-w-[240px]">
          <RadialChart
            angleType="time"
            data={days}
            xDataKey="date"
            series={series}
            valueKeys={["minmin", "maxmax"]}
            minValue="auto"
            maxValue="auto"
            niceValues={false}
            hoveredIndex={hovered}
            onHoverChange={setHovered}
          >
            <RadialAxis showCircle={false} showValueLabels={false} />
            {/* Record range, then the normal range on top */}
            <RadialArea dataKey="maxmax" baseDataKey="minmin" color="var(--chart-1)" fillOpacity={0.14} rampFrom={1} stroke="none" curve="linear" />
            <RadialArea dataKey="max" baseDataKey="min" color="var(--chart-1)" fillOpacity={0.3} rampFrom={1} stroke="none" curve="linear" />
            <RadialLine dataKey="avg" strokeWidth={1.5} />
            <RadialScrubber variant="gradient" />
          </RadialChart>
        </div>
        <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
          <div>
            <div className="font-semibold text-3xl tabular-nums tracking-tight">{stats.avg.toFixed(1)}°F</div>
            <div className="text-muted-foreground text-xs">
              {day ? \`average on \${dayFormat.format(day.date)}\` : "annual average"}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 border-t pt-3">
            <TemperatureRange label={day ? "Normal low–high" : "Normal range"} low={stats.min} high={stats.max} opacity={0.45} />
            <TemperatureRange label="Record low–high" low={stats.minmin} high={stats.maxmax} opacity={0.2} />
          </div>
        </div>
      </div>
    </div>
  );
}
`;

export const seasonalTemperatureCard: Recipe = {
  id: "seasonal-temperature-card",
  title: "Seasonal temperature card",
  category: "radial",
  description:
    "A year of temperatures wrapped into a loop, with the hovered day's normals and records beside it.",
  look: "a bordered card titled with the station (“San Francisco (SFO)”) and the years covered. On the left, a radial year: month labels around the rim, a pale band for record lows to record highs, a stronger band for the normal low–high and a thin line for the daily average, with a scrubber on hover. On the right, the average temperature in large type with a caption (“annual average”, or “average on Jul 14” when hovered), then a divider and two rows — normal and record ranges — each with a swatch matching its band.",
  charts: [
    {
      id: "radial",
      label: "Radial",
      rootComponent: "RadialChart",
      Preview: SeasonalTemperatureCard,
      install: ["radial-chart"],
      steps: [
        'Use one datum per day with `date` (UTC ms) on `angleType="time"`, and `valueKeys={["minmin", "maxmax"]}` with `minValue="auto" maxValue="auto" niceValues={false}` so the record extremes set the scale.',
        "Lift hover into the card (`hoveredIndex` / `onHoverChange` on `<RadialChart>`).",
        'Draw `<RadialAxis showCircle={false} showValueLabels={false} />`, a record band `<RadialArea dataKey="maxmax" baseDataKey="minmin" color="var(--chart-1)" fillOpacity={0.14} rampFrom={1} stroke="none" curve="linear" />`, a normal band (`max` / `min`, `fillOpacity={0.3}`), `<RadialLine dataKey="avg" strokeWidth={1.5} />` and `<RadialScrubber variant="gradient" />`.',
        "Beside the chart, show the average (`text-3xl`, `°F`) with a caption, then a `border-t` divider and normal / record range rows whose swatches use the band opacities (0.45 / 0.2).",
        "Read the hovered day, else annual figures, so the stats follow the scrubber.",
      ],
      code: TEMPERATURE_SOURCE,
    },
  ],
};
