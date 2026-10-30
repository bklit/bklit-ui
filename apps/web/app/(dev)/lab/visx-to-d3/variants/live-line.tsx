"use client";

import {
  Background,
  ChartTooltip,
  Grid,
  LiveLine,
  LiveLineChart,
  type LiveLinePoint,
  LiveXAxis,
  LiveYAxis,
  type MomentumColors,
  ReferenceArea,
} from "@bklitui/ui/charts";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { FrozenNow, LAB_NOW, seededRandom } from "./deterministic";
import { EXAMPLE_MARGIN } from "./line-data";
import type { LabVariant } from "./types";

const EXAMPLES = "chart-examples.tsx";
const DOCS = "components/docs/live-line-chart-demo.tsx";

/**
 * The seed half of the sources' `useLiveData(initialPrice, intervalMs)`:
 * `count` points `intervalMs` apart ending one interval before "now", with a
 * seeded random walk, and `value` = the unrounded last price. "Now" is
 * `LAB_NOW`; no ticking interval (the frozen variants never append).
 */
function seedLiveData(
  initialPrice: number,
  intervalMs: number,
  seed: number,
  count = 40
): { data: LiveLinePoint[]; value: number } {
  const random = seededRandom(seed);
  const nowSec = LAB_NOW / 1000;
  const data: LiveLinePoint[] = [];
  let p = initialPrice;
  let mom = 0;
  for (let i = count; i > 0; i--) {
    mom = mom * 0.92 + (random() - 0.48) * 0.012;
    p *= 1 + mom;
    p = Math.max(p, 1);
    data.push({
      time: nowSec - i * (intervalMs / 1000),
      value: Math.round(p * 100) / 100,
    });
  }
  return { data, value: p };
}

const basic = seedLiveData(142.5, 600, 1425);
const offset = seedLiveData(0.002_34, 500, 234);
const momentum = seedLiveData(85, 500, 85);
const noFill = seedLiveData(72, 550, 72);
const docs = seedLiveData(142.5, 600, 2600, 30);

const formatUsd = (v: number) => `$${v.toFixed(2)}`;
const formatSats = (v: number) => `${v.toFixed(5)} BTC`;

const momentumColors: MomentumColors = {
  up: "var(--chart-positive)",
  down: "var(--chart-negative)",
  flat: "var(--muted-foreground)",
};

/**
 * The y range starts at [0, 100] and eases to the data at `lerpSpeed` per
 * frame; at the default 0.08 that takes ~7 s (longer for tiny values like
 * the BTC example), too close to the recorder's 8 s settle timeout. A faster
 * lerp reaches the same settled range; only the approach is quicker.
 */
const FROZEN_LERP_SPEED = 0.3;

/**
 * chart-examples `LiveLineExampleChart` (example margin merged under the
 * per-example margin), frozen: `Date.now()` pinned while mounted + `paused`.
 */
function FrozenLiveChart({
  margin,
  ...props
}: ComponentProps<typeof LiveLineChart>) {
  return (
    <FrozenNow at={LAB_NOW}>
      <LiveLineChart
        {...props}
        lerpSpeed={FROZEN_LERP_SPEED}
        margin={{ ...EXAMPLE_MARGIN, ...margin }}
        paused
      />
    </FrozenNow>
  );
}

function valueTooltip(format: (v: number) => string, className: string) {
  return (
    <ChartTooltip
      content={({ point }) => (
        <div className={className}>{format((point.value as number) ?? 0)}</div>
      )}
      showDatePill={false}
    />
  );
}

/** chart-examples Live Line Pattern / Dots / Reference band demos. */
function LiveUsdChart({ underlay }: { underlay: ReactNode }) {
  return (
    <FrozenLiveChart
      data={basic.data}
      margin={{ left: 28 }}
      style={{ height: 240 }}
      value={basic.value}
      window={30}
    >
      {underlay}
      <LiveLine
        dataKey="value"
        formatValue={formatUsd}
        stroke="var(--chart-1)"
      />
      <LiveXAxis />
      <LiveYAxis formatValue={formatUsd} position="left" />
    </FrozenLiveChart>
  );
}

/**
 * Real ticking stream (the sources' full `useLiveData`): seeded walk, but
 * appends on a wall-clock interval, so it never settles.
 */
function useTickingData(initialPrice: number, intervalMs: number) {
  const [state, setState] = useState(() =>
    seedLiveData(initialPrice, intervalMs, 1425)
  );
  const priceRef = useRef(state.value);
  const momentumRef = useRef(0);
  useEffect(() => {
    const random = seededRandom(7);
    const id = setInterval(() => {
      momentumRef.current =
        momentumRef.current * 0.88 + (random() - 0.48) * 0.008;
      momentumRef.current *= 0.995;
      priceRef.current *= 1 + momentumRef.current;
      priceRef.current = Math.max(priceRef.current, 1);
      const rounded = Math.round(priceRef.current * 100) / 100;
      setState((prev) => {
        const cutoff = Date.now() / 1000 - 120;
        return {
          data: [
            ...prev.data.filter((p) => p.time >= cutoff),
            { time: Date.now() / 1000, value: rounded },
          ],
          value: rounded,
        };
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return state;
}

function TickingBasic() {
  const { data, value } = useTickingData(142.5, 600);
  return (
    <LiveLineChart
      data={data}
      margin={{ ...EXAMPLE_MARGIN, left: 28 }}
      style={{ height: 240 }}
      value={value}
      window={30}
    >
      <LiveLine
        dataKey="value"
        formatValue={formatUsd}
        stroke="var(--chart-1)"
      />
      <LiveXAxis />
      <LiveYAxis formatValue={formatUsd} position="left" />
    </LiveLineChart>
  );
}

export const LIVE_LINE_VARIANTS: readonly LabVariant[] = [
  {
    kind: "single",
    id: "basic",
    label: "Basic",
    source: `${EXAMPLES}: "Live Line Chart" (LiveLineBasicDemo); same render as makeLiveLineHero "Live Line Chart - Interactive"`,
    exercises:
      "frozen window (paused, Date.now pinned): live line + area fill + live dot/badge, LiveXAxis, left LiveYAxis, custom tooltip content",
    render: () => (
      <FrozenLiveChart
        data={basic.data}
        margin={{ left: 28 }}
        style={{ height: 240 }}
        value={basic.value}
        window={30}
      >
        <LiveLine
          dataKey="value"
          formatValue={formatUsd}
          stroke="var(--chart-1)"
        />
        <ChartTooltip
          content={({ point }) => (
            <div className="px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">
                {(point.value as number)?.toFixed(2)}
              </span>
            </div>
          )}
          showDatePill={false}
        />
        <LiveXAxis />
        <LiveYAxis formatValue={formatUsd} position="left" />
      </FrozenLiveChart>
    ),
  },
  {
    kind: "single",
    id: "now-offset",
    label: "Now offset",
    source: `${EXAMPLES}: "Live Line - Now Offset" (LiveLineOffsetDemo)`,
    exercises:
      "nowOffsetUnits 1 (right-edge fade), exaggerate y range, dotSize 4, window 20",
    render: () => (
      <FrozenLiveChart
        data={offset.data}
        exaggerate
        margin={{ left: 36 }}
        nowOffsetUnits={1}
        style={{ height: 220 }}
        value={offset.value}
        window={20}
      >
        <LiveLine
          dataKey="value"
          dotSize={4}
          formatValue={formatSats}
          stroke="var(--chart-3)"
        />
        {valueTooltip(formatSats, "px-3 py-2.5 text-sm tabular-nums")}
        <LiveXAxis />
        <LiveYAxis formatValue={formatSats} position="left" />
      </FrozenLiveChart>
    ),
  },
  {
    kind: "single",
    id: "momentum",
    label: "Momentum colours",
    source: `${EXAMPLES}: "Live Line - Momentum Colors" (LiveLineMomentumDemo)`,
    exercises: "momentumColors up/down/flat, dotSize 5, window 25",
    render: () => (
      <FrozenLiveChart
        data={momentum.data}
        margin={{ left: 28 }}
        style={{ height: 240 }}
        value={momentum.value}
        window={25}
      >
        <LiveLine
          dataKey="value"
          dotSize={5}
          formatValue={formatUsd}
          momentumColors={momentumColors}
        />
        {valueTooltip(formatUsd, "px-3 py-2.5 text-sm tabular-nums")}
        <LiveXAxis />
        <LiveYAxis formatValue={formatUsd} position="left" />
      </FrozenLiveChart>
    ),
  },
  {
    kind: "single",
    id: "line-only",
    label: "Line only",
    source: `${EXAMPLES}: "Live Line - Line Only" (LiveLineNoFillDemo)`,
    exercises: "fill={false}, window 28",
    render: () => (
      <FrozenLiveChart
        data={noFill.data}
        margin={{ left: 28 }}
        style={{ height: 240 }}
        value={noFill.value}
        window={28}
      >
        <LiveLine
          dataKey="value"
          fill={false}
          formatValue={formatUsd}
          stroke="var(--chart-1)"
        />
        {valueTooltip(formatUsd, "px-3 py-2.5 text-sm tabular-nums")}
        <LiveXAxis />
        <LiveYAxis formatValue={formatUsd} position="left" />
      </FrozenLiveChart>
    ),
  },
  {
    kind: "single",
    id: "pattern-background",
    label: "Pattern background",
    source: `${EXAMPLES}: "Live Line - Pattern Background" (LiveLineBackgroundDiagonalDemo)`,
    exercises: "Background diagonal in the live chart (no tooltip)",
    render: () => <LiveUsdChart underlay={<Background />} />,
  },
  {
    kind: "single",
    id: "dot-background",
    label: "Dot grid background",
    source: `${EXAMPLES}: "Live Line - Dot Grid Background" (LiveLineBackgroundDotsDemo)`,
    exercises: 'Background pattern="dots" opacity 0.85',
    render: () => (
      <LiveUsdChart underlay={<Background opacity={0.85} pattern="dots" />} />
    ),
  },
  {
    kind: "single",
    id: "reference-band",
    label: "Reference band",
    source: `${EXAMPLES}: "Live Line - Reference Band" (LiveLineReferenceBandDemo)`,
    exercises:
      "ReferenceArea y1 138 / y2 148 dashed + markers on the live y scale",
    render: () => (
      <LiveUsdChart
        underlay={
          <ReferenceArea showMarkers strokeStyle="dashed" y1={138} y2={148} />
        }
      />
    ),
  },
  {
    kind: "single",
    id: "pattern-reference-band",
    label: "Pattern reference band",
    source: `${EXAMPLES}: "Live Line - Pattern Reference Band" (LiveLinePatternReferenceBandDemo)`,
    exercises: "ReferenceArea pattern fill + axisLabelColor on LiveYAxis ticks",
    render: () => (
      <LiveUsdChart
        underlay={
          <ReferenceArea
            axisLabelColor="var(--chart-1)"
            fillOpacity={0.85}
            pattern="diagonal"
            patternColor="var(--chart-foreground-muted)"
            y1={138}
            y2={148}
          />
        }
      />
    ),
  },
  {
    kind: "single",
    id: "docs",
    label: "Docs preview",
    source: `${DOCS} LiveLineChartDemo (live-line-chart.mdx)`,
    exercises:
      "explicit margin 16/16/40/56, 30 seed points, height 260, time + price tooltip content",
    render: () => (
      <FrozenNow at={LAB_NOW}>
        <div className="w-full">
          <LiveLineChart
            data={docs.data}
            lerpSpeed={FROZEN_LERP_SPEED}
            margin={{ top: 16, right: 16, bottom: 40, left: 56 }}
            paused
            style={{ height: 260 }}
            value={docs.value}
            window={30}
          >
            <LiveLine
              dataKey="value"
              formatValue={formatUsd}
              stroke="var(--chart-line-primary)"
            />
            <ChartTooltip
              content={({ point }) => {
                const date =
                  point.date instanceof Date ? point.date : new Date(LAB_NOW);
                const time = date.toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });
                const val = typeof point.value === "number" ? point.value : 0;
                return (
                  <div className="px-3 py-2.5">
                    <div className="mb-1.5 font-medium text-popover-foreground text-xs opacity-60">
                      {time}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="ml-auto font-medium text-popover-foreground tabular-nums">
                        {formatUsd(val)}
                      </span>
                    </div>
                  </div>
                );
              }}
              showDatePill={false}
            />
            <LiveXAxis />
            <LiveYAxis formatValue={formatUsd} position="left" />
          </LiveLineChart>
        </div>
      </FrozenNow>
    ),
  },
  {
    kind: "single",
    id: "grid-right-axis",
    label: "Grid + right axis, no pulse/badge",
    source:
      'live-line-chart.mdx props tables ("Grid with Live Charts", LiveLine pulse/badge/strokeWidth, LiveYAxis position, numXTicks)',
    exercises:
      "Grid on the live y scale, right LiveYAxis, numXTicks 7, pulse={false} badge={false} strokeWidth 3",
    render: () => (
      <FrozenLiveChart
        data={basic.data}
        margin={{ right: 56 }}
        numXTicks={7}
        style={{ height: 240 }}
        value={basic.value}
        window={30}
      >
        <Grid horizontal />
        <LiveLine
          badge={false}
          dataKey="value"
          pulse={false}
          stroke="var(--chart-2)"
          strokeWidth={3}
        />
        <LiveXAxis />
        <LiveYAxis formatValue={formatUsd} position="right" />
      </FrozenLiveChart>
    ),
  },
  {
    kind: "single",
    id: "live-ticking",
    label: "Live (ticking)",
    source: `${EXAMPLES}: "Live Line Chart" with the real interval stream`,
    exercises: "unpaused scroll + appended points + y-range lerp",
    hover: false,
    previewOnly:
      "streams on a wall-clock interval and scrolls with Date.now(), so it never settles; the frozen variants cover the geometry",
    render: () => <TickingBasic />,
  },
];
