"use client";

import { Gauge, type GaugeProps, PatternPreset } from "@bklitui/ui/charts";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";

export function GaugeChartDemo() {
  return (
    <div className="mx-auto w-full min-w-[300px] max-w-lg py-4">
      <Gauge
        centerValue={428_000}
        defaultLabel="ARR run rate"
        formatOptions={{
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }}
        inactiveFillOpacity={0.4}
        spacing={25}
        value={66}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared layout                                                              */
/* -------------------------------------------------------------------------- */

const WHOLE = { maximumFractionDigits: 0 } as const;

/** Fine-notch dial used as the base for ruler / needle demos. */
const DIAL_BASE: Partial<GaugeProps> = {
  endAngle: 392,
  inactiveFillOpacity: 0.7,
  notchCornerRadius: 2,
  notchLengthPercent: 34,
  spacing: 40,
  startAngle: 148,
  totalNotches: 72,
};

function GaugeTile({
  caption,
  children,
}: {
  caption: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="flex min-w-0 flex-col items-center gap-2">
      <div className="w-full min-w-0">{children}</div>
      <figcaption className="font-mono text-muted-foreground text-xs">
        {caption}
      </figcaption>
    </figure>
  );
}

function GaugeGrid({
  columns = 3,
  children,
}: {
  columns?: 2 | 3;
  children: ReactNode;
}) {
  const cols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
  }[columns];
  return (
    <div className={`grid w-full grid-cols-1 gap-6 ${cols}`}>{children}</div>
  );
}

/* -------------------------------------------------------------------------- */
/* Animation                                                                  */
/* -------------------------------------------------------------------------- */

const ANIMATION_VALUES = [38, 72, 91, 54, 18, 66];

export function GaugeAnimationDemo() {
  const [step, setStep] = useState(0);
  const [replay, setReplay] = useState(0);
  const value = ANIMATION_VALUES[step % ANIMATION_VALUES.length] ?? 66;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4">
      <Gauge
        {...DIAL_BASE}
        centerValue={value}
        defaultLabel="Cluster load"
        formatOptions={WHOLE}
        key={replay}
        minWidth={0}
        needle="line"
        ruler
        suffix="%"
        value={value}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => setStep((s) => s + 1)}
          size="sm"
          variant="outline"
        >
          Change value
        </Button>
        <Button
          onClick={() => setReplay((n) => n + 1)}
          size="sm"
          variant="ghost"
        >
          Replay enter
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Arc styles                                                                 */
/* -------------------------------------------------------------------------- */

export function GaugeArcStylesDemo() {
  return (
    <GaugeGrid>
      <GaugeTile caption='arcStyle="notches"'>
        <Gauge
          centerValue={64}
          defaultLabel="Notches"
          formatOptions={WHOLE}
          inactiveFillOpacity={0.4}
          minWidth={0}
          suffix="%"
          value={64}
        />
      </GaugeTile>
      <GaugeTile caption='arcStyle="solid"'>
        <Gauge
          arcStyle="solid"
          arcThickness={0.05}
          centerValue={64}
          defaultLabel="Solid"
          formatOptions={WHOLE}
          inactiveFillOpacity={0.6}
          minWidth={0}
          suffix="%"
          value={64}
        />
      </GaugeTile>
      <GaugeTile caption='arcStyle="none" + progressRing'>
        <Gauge
          arcStyle="none"
          centerValue={64}
          defaultLabel="None"
          formatOptions={WHOLE}
          minWidth={0}
          progressRing
          suffix="%"
          value={64}
        />
      </GaugeTile>
    </GaugeGrid>
  );
}

/* -------------------------------------------------------------------------- */
/* Ruler                                                                      */
/* -------------------------------------------------------------------------- */

export function GaugeRulerDemo() {
  return (
    <GaugeGrid>
      <GaugeTile caption="ruler">
        <Gauge
          {...DIAL_BASE}
          centerValue={53}
          defaultLabel="Inside"
          formatOptions={WHOLE}
          minWidth={0}
          ruler
          suffix="%"
          value={53}
        />
      </GaugeTile>
      <GaugeTile caption='position: "outside", labels: "ends"'>
        <Gauge
          arcStyle="solid"
          centerValue={53}
          defaultLabel="Outside"
          formatOptions={WHOLE}
          inactiveFillOpacity={0.6}
          minWidth={0}
          ruler={{
            position: "outside",
            ticks: 20,
            majorEvery: 5,
            labels: "ends",
          }}
          suffix="%"
          value={53}
        />
      </GaugeTile>
      <GaugeTile caption="labels: { min: 0, max: 8, format }">
        <Gauge
          arcStyle="solid"
          arcThickness={0.02}
          centerValue={4.2}
          defaultLabel="rpm × 1000"
          formatOptions={{ maximumFractionDigits: 1 }}
          inactiveFillOpacity={0.6}
          minWidth={0}
          ruler={{
            position: "outside",
            ticks: 16,
            majorEvery: 4,
            labels: { min: 0, max: 8, format: (v) => `${v}k` },
          }}
          value={(4.2 / 8) * 100}
        />
      </GaugeTile>
    </GaugeGrid>
  );
}

/* -------------------------------------------------------------------------- */
/* Needles                                                                    */
/* -------------------------------------------------------------------------- */

const NEEDLE_VARIANTS = ["line", "gradient", "triangle", "polygon"] as const;

export function GaugeNeedleDemo() {
  return (
    <GaugeGrid columns={2}>
      {NEEDLE_VARIANTS.map((variant) => (
        <GaugeTile caption={`needle="${variant}"`} key={variant}>
          <Gauge
            {...DIAL_BASE}
            centerValue={62}
            defaultLabel={variant}
            formatOptions={WHOLE}
            minWidth={0}
            needle={variant}
            ruler
            suffix="%"
            value={62}
          />
        </GaugeTile>
      ))}
    </GaugeGrid>
  );
}

const NEEDLE_TIPS = ["inner", "outer", "edge"] as const;

export function GaugeNeedleTipDemo() {
  return (
    <GaugeGrid>
      {NEEDLE_TIPS.map((tip) => (
        <GaugeTile caption={`tip: "${tip}"`} key={tip}>
          <Gauge
            arcStyle="solid"
            centerValue={62}
            defaultLabel={tip}
            formatOptions={WHOLE}
            inactiveFillOpacity={0.6}
            minWidth={0}
            needle={{ variant: "triangle", tip, length: 0.3, width: 8 }}
            ruler={{ position: "outside", ticks: 20, majorEvery: 5 }}
            suffix="%"
            value={62}
          />
        </GaugeTile>
      ))}
    </GaugeGrid>
  );
}

/* -------------------------------------------------------------------------- */
/* Zones                                                                      */
/* -------------------------------------------------------------------------- */

const TRAFFIC_ZONES = [
  { from: 0, to: 60, color: "#22c55e" },
  { from: 60, to: 85, color: "#f59e0b" },
  { from: 85, to: 100, color: "#ef4444" },
];

export function GaugeZonesDemo() {
  return (
    <GaugeGrid>
      <GaugeTile caption='zoneDisplay="band"'>
        <Gauge
          arcStyle="solid"
          centerValue={78}
          defaultLabel="Band"
          formatOptions={WHOLE}
          inactiveFillOpacity={0.6}
          minWidth={0}
          suffix="%"
          value={78}
          zones={TRAFFIC_ZONES}
        />
      </GaugeTile>
      <GaugeTile caption='zoneDisplay="fill"'>
        <Gauge
          centerValue={92}
          defaultLabel="Fill"
          formatOptions={WHOLE}
          inactiveFillOpacity={0.3}
          minWidth={0}
          suffix="%"
          totalNotches={60}
          value={92}
          zoneDisplay="fill"
          zones={TRAFFIC_ZONES}
        />
      </GaugeTile>
      <GaugeTile caption='zoneDisplay="both"'>
        <Gauge
          arcStyle="solid"
          centerValue={92}
          defaultLabel="Both"
          formatOptions={WHOLE}
          inactiveFillOpacity={0.6}
          minWidth={0}
          suffix="%"
          value={92}
          zoneDisplay="both"
          zones={TRAFFIC_ZONES}
        />
      </GaugeTile>
    </GaugeGrid>
  );
}

/* -------------------------------------------------------------------------- */
/* Sectors                                                                    */
/* -------------------------------------------------------------------------- */

export function GaugeSectorDemo() {
  return (
    <GaugeGrid>
      <GaugeTile caption='gradient: "conic"'>
        <Gauge
          arcStyle="none"
          centerValue={68}
          defaultLabel="Conic"
          formatOptions={WHOLE}
          minWidth={0}
          progressRing
          sector
          suffix="%"
          value={68}
        />
      </GaugeTile>
      <GaugeTile caption='gradient: "radial"'>
        <Gauge
          arcStyle="solid"
          arcThickness={0.02}
          centerValue={68}
          defaultLabel="Radial"
          formatOptions={WHOLE}
          inactiveFillOpacity={0.6}
          minWidth={0}
          sector={{ gradient: "radial", innerRadius: 0.3 }}
          suffix="%"
          value={68}
        />
      </GaugeTile>
      <GaugeTile caption='gradient: "none" + url(#pattern)'>
        <Gauge
          arcStyle="none"
          centerValue={68}
          defaultLabel="Pattern"
          formatOptions={WHOLE}
          minWidth={0}
          progressRing
          sector={{
            gradient: "none",
            color: "url(#docs-gauge-sector-pattern)",
            innerRadius: 0.5,
            opacity: 1,
          }}
          suffix="%"
          value={68}
        >
          <PatternPreset
            color="var(--chart-1)"
            id="docs-gauge-sector-pattern"
            preset="diagonal-up"
          />
        </Gauge>
      </GaugeTile>
    </GaugeGrid>
  );
}

/* -------------------------------------------------------------------------- */
/* Progress ring · dots · glow · center disc                                  */
/* -------------------------------------------------------------------------- */

export function GaugeProgressRingDemo() {
  return (
    <GaugeGrid columns={2}>
      <GaugeTile caption="progressRing">
        <Gauge
          centerValue={71}
          defaultLabel="Notches + ring"
          formatOptions={WHOLE}
          inactiveFillOpacity={0.35}
          minWidth={0}
          progressRing
          suffix="%"
          value={71}
        />
      </GaugeTile>
      <GaugeTile caption="progressRing={{ color, width, gap }}">
        <Gauge
          arcStyle="none"
          centerValue={71}
          defaultLabel="Ring only"
          formatOptions={WHOLE}
          minWidth={0}
          progressRing={{ color: "var(--chart-3)", width: 0.022, gap: 0 }}
          suffix="%"
          value={71}
        />
      </GaugeTile>
    </GaugeGrid>
  );
}

export function GaugeDotsDemo() {
  return (
    <GaugeGrid columns={2}>
      <GaugeTile caption="dots">
        <Gauge
          arcStyle="solid"
          centerValue={83}
          defaultLabel="Behind a solid arc"
          dots
          formatOptions={WHOLE}
          inactiveFillOpacity={0.6}
          minWidth={0}
          suffix="%"
          value={83}
        />
      </GaugeTile>
      <GaugeTile caption="dots={{ rings: 7, spacing: 0.032, radius: 2.2 }}">
        <Gauge
          arcStyle="none"
          centerValue={83}
          defaultLabel="Uptime score"
          dots={{ rings: 7, spacing: 0.032, radius: 2.2 }}
          formatOptions={WHOLE}
          minWidth={0}
          progressRing
          value={83}
        />
      </GaugeTile>
    </GaugeGrid>
  );
}

export function GaugeGlowDemo() {
  return (
    <GaugeGrid columns={2}>
      <GaugeTile caption="glow">
        <Gauge
          activeFill="#38bdf8"
          centerValue={74}
          defaultLabel="Lit notches"
          formatOptions={WHOLE}
          glow
          inactiveFillOpacity={0.25}
          minWidth={0}
          notchCornerRadius={1}
          notchLengthPercent={55}
          spacing={35}
          suffix="%"
          totalNotches={60}
          value={74}
        />
      </GaugeTile>
      <GaugeTile caption="glow={{ blur: 10, intensity: 1 }}">
        <Gauge
          activeFill="#a855f7"
          arcStyle="solid"
          centerValue={74}
          defaultLabel="Solid arc"
          formatOptions={WHOLE}
          glow={{ blur: 10, intensity: 1 }}
          inactiveFillOpacity={0.5}
          minWidth={0}
          suffix="%"
          value={74}
        />
      </GaugeTile>
    </GaugeGrid>
  );
}

export function GaugeCenterDiscDemo() {
  return (
    <GaugeGrid columns={2}>
      <GaugeTile caption="centerDisc">
        <Gauge
          arcStyle="none"
          centerDisc
          centerValue={68}
          defaultLabel="Disc + sector"
          formatOptions={WHOLE}
          minWidth={0}
          sector
          suffix="%"
          value={68}
        />
      </GaugeTile>
      <GaugeTile caption="centerDisc={{ radius, stroke, strokeWidth }}">
        <Gauge
          arcStyle="solid"
          centerDisc={{
            radius: 0.22,
            stroke: "var(--chart-1)",
            strokeOpacity: 1,
            strokeWidth: 2,
          }}
          centerValue={68}
          defaultLabel="Custom ring"
          formatOptions={WHOLE}
          inactiveFillOpacity={0.6}
          minWidth={0}
          needle={{ variant: "line", tip: "outer", length: 0.45 }}
          suffix="%"
          value={68}
        />
      </GaugeTile>
    </GaugeGrid>
  );
}

/* -------------------------------------------------------------------------- */
/* Composed recipes                                                           */
/* -------------------------------------------------------------------------- */

function RecipeShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-md">{children}</div>;
}

export function GaugeFanDutyDemo() {
  return (
    <RecipeShell>
      <Gauge
        activeFill="var(--foreground)"
        arcStyle="solid"
        centerValue={72}
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
        value={72}
        zones={[{ from: 80, to: 100, color: "#ef4444" }]}
      />
    </RecipeShell>
  );
}

export function GaugeSpeedometerDemo() {
  return (
    <RecipeShell>
      <Gauge
        activeFill="#38bdf8"
        centerValue={228}
        defaultLabel="km/h"
        dots={{ color: "#ef4444", rings: 6 }}
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
        value={(228 / 260) * 100}
        zoneDisplay="fill"
        zones={[{ from: 78, to: 100, color: "#ef4444" }]}
      />
    </RecipeShell>
  );
}

export function GaugeTonnesDemo() {
  return (
    <RecipeShell>
      <Gauge
        arcStyle="none"
        centerDisc
        centerValue={518}
        defaultLabel="tonnes per day"
        formatOptions={WHOLE}
        minWidth={0}
        needle={{ variant: "triangle", tip: "outer", length: 0.62, width: 8 }}
        progressRing={{ color: "#38bdf8" }}
        ruler={{ ticks: 16, majorEvery: 2, labels: { min: 0, max: 800 } }}
        sector={{ color: "#38bdf8" }}
        value={(518 / 800) * 100}
      />
    </RecipeShell>
  );
}
