/**
 * Illustrations for chart utilities (legend, grid, tooltip, axis, …).
 * Visual language adapted from coss ui's category thumbnails (MIT) — see
 * ./primitives.tsx for attribution.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Dot,
  FadeGradient,
  Text,
  ThumbCard,
  ThumbHeader,
  ThumbPanel,
  ThumbSvg,
} from "./primitives";

const ACCENT_BG = "bg-linear-to-b from-(--btn-from) to-(--btn-to)";
const BASE_LINE =
  "M0 38C12 34 20 24 32 26S52 34 64 28S88 12 100 14S114 18 120 12";

function SoftLine({ d = BASE_LINE, accent = true }) {
  return (
    <path
      className={accent ? "text-primary" : undefined}
      d={d}
      stroke="currentColor"
      strokeLinecap="round"
      strokeOpacity={accent ? 0.88 : 0.4}
      strokeWidth={1.5}
    />
  );
}

const LEGEND_ROWS = [
  { w: "w-[78%]", key: "a" },
  { w: "w-[54%]", key: "b" },
  { w: "w-[32%]", key: "c" },
] as const;

function LegendIllustration() {
  return (
    <ThumbCard className="max-w-44">
      <ThumbPanel className="flex flex-col gap-3.5">
        {LEGEND_ROWS.map((row, i) => (
          <div className="flex flex-col gap-1.5" key={row.key}>
            <div className="flex items-center gap-1.5">
              <Dot accent={i === 0} className="size-1.5" />
              <Text
                className="w-[40%]"
                variant={i === 0 ? "main" : "secondary"}
              />
              <Text className="ms-auto w-4" variant="secondary" />
            </div>
            <div className="h-1 rounded-full bg-muted-foreground/10">
              <div
                className={cn(
                  "h-full rounded-full",
                  row.w,
                  i === 0 ? ACCENT_BG : "bg-muted-foreground/32"
                )}
              />
            </div>
          </div>
        ))}
      </ThumbPanel>
    </ThumbCard>
  );
}

function GridIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel>
        <ThumbSvg viewBox="0 0 120 64">
          <defs>
            <linearGradient id="bk-ill-grid-fade" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="white" stopOpacity={0} />
              <stop offset="0.2" stopColor="white" stopOpacity={1} />
              <stop offset="0.8" stopColor="white" stopOpacity={1} />
              <stop offset="1" stopColor="white" stopOpacity={0} />
            </linearGradient>
            <mask id="bk-ill-grid-mask">
              <rect fill="url(#bk-ill-grid-fade)" height="64" width="120" />
            </mask>
          </defs>
          <g mask="url(#bk-ill-grid-mask)">
            {[4, 18, 32, 46, 60].map((y) => (
              <line
                key={`h-${y}`}
                stroke="currentColor"
                strokeDasharray="3 3"
                strokeOpacity={0.32}
                x1="0"
                x2="120"
                y1={y}
                y2={y}
              />
            ))}
            {[20, 40, 60, 80, 100].map((x) => (
              <line
                key={`v-${x}`}
                stroke="currentColor"
                strokeDasharray="3 3"
                strokeOpacity={0.16}
                x1={x}
                x2={x}
                y1="4"
                y2="60"
              />
            ))}
          </g>
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

function BackgroundIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <ThumbHeader />
        <ThumbSvg viewBox="0 0 120 50">
          <defs>
            <pattern
              height="5"
              id="bk-ill-bg-pattern"
              patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse"
              width="5"
            >
              <line
                stroke="currentColor"
                strokeOpacity={0.24}
                x1="0"
                x2="0"
                y1="0"
                y2="5"
              />
            </pattern>
            <radialGradient cx="0.5" cy="0.5" id="bk-ill-bg-fade" r="0.6">
              <stop offset="0.4" stopColor="white" stopOpacity={1} />
              <stop offset="1" stopColor="white" stopOpacity={0} />
            </radialGradient>
            <mask id="bk-ill-bg-mask">
              <rect fill="url(#bk-ill-bg-fade)" height="50" width="120" />
            </mask>
          </defs>
          <rect
            fill="url(#bk-ill-bg-pattern)"
            height="50"
            mask="url(#bk-ill-bg-mask)"
            width="120"
          />
          <SoftLine d="M0 36C12 32 20 22 32 24S52 32 64 26S88 10 100 12S114 16 120 10" />
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

function ReferenceAreaIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <ThumbHeader />
        <div className="flex gap-2">
          <div className="flex flex-col justify-between py-0.5">
            <Text className="w-3" variant="secondary" />
            <Text className="w-3 bg-primary/60" />
            <Text className="w-3 bg-primary/60" />
            <Text className="w-3" variant="secondary" />
          </div>
          <ThumbSvg className="flex-1" viewBox="0 0 104 50">
            <rect
              fill="currentColor"
              fillOpacity={0.1}
              height="16"
              width="104"
              x="0"
              y="14"
            />
            {[14, 30].map((y) => (
              <line
                key={`edge-${y}`}
                stroke="currentColor"
                strokeDasharray="2 2"
                strokeOpacity={0.4}
                x1="0"
                x2="104"
                y1={y}
                y2={y}
              />
            ))}
            <SoftLine d="M0 40C10 36 18 24 28 26S44 34 54 22S74 6 84 12S98 26 104 20" />
          </ThumbSvg>
        </div>
      </ThumbPanel>
    </ThumbCard>
  );
}

function ProjectionLineIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <ThumbHeader />
        <ThumbSvg viewBox="0 0 120 50">
          <defs>
            <FadeGradient from={0.12} id="bk-ill-proj-fill" />
          </defs>
          <path d="M70 26L120 8L120 22Z" fill="url(#bk-ill-proj-fill)" />
          <SoftLine accent={false} d="M0 40C12 36 22 30 32 32S52 30 70 26" />
          <path
            className="text-primary"
            d="M70 26C86 22 100 18 120 14"
            stroke="currentColor"
            strokeDasharray="3 3"
            strokeLinecap="round"
            strokeOpacity={0.88}
            strokeWidth={1.5}
          />
          <line
            stroke="currentColor"
            strokeOpacity={0.2}
            x1="70"
            x2="70"
            y1="0"
            y2="50"
          />
          <circle
            className="fill-card text-primary"
            cx="120"
            cy="14"
            r="2.5"
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <circle
            cx="70"
            cy="26"
            fill="currentColor"
            fillOpacity={0.56}
            r="2"
          />
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

function TrendLineIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <ThumbHeader />
        <ThumbSvg viewBox="0 0 120 50">
          <SoftLine
            accent={false}
            d="M0 40L14 30L26 36L40 24L54 30L68 18L82 24L96 10L108 18L120 8"
          />
          {[
            [0, 40],
            [26, 36],
            [54, 30],
            [82, 24],
            [108, 18],
          ].map(([cx, cy]) => (
            <circle
              cx={cx}
              cy={cy}
              fill="currentColor"
              fillOpacity={0.4}
              key={`pt-${cx}`}
              r="1.5"
            />
          ))}
          <line
            className="text-primary"
            stroke="currentColor"
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeOpacity={0.88}
            strokeWidth={1.5}
            x1="2"
            x2="118"
            y1="38"
            y2="10"
          />
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

function MarkersIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <ThumbHeader />
        <ThumbSvg viewBox="0 0 120 50">
          {[36, 84].map((x) => (
            <line
              key={x}
              stroke="currentColor"
              strokeDasharray="2 2"
              strokeOpacity={0.32}
              x1={x}
              x2={x}
              y1="9"
              y2="50"
            />
          ))}
          <SoftLine />
          <circle
            className="fill-card text-primary"
            cx="36"
            cy="4"
            r="3.5"
            stroke="currentColor"
            strokeWidth={1.25}
          />
          <rect
            fill="currentColor"
            fillOpacity={0.56}
            height="4.5"
            transform="rotate(45 84 4)"
            width="4.5"
            x="81.75"
            y="1.75"
          />
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

function TooltipIllustration() {
  return (
    <div className="relative w-full max-w-48">
      <ThumbCard>
        <ThumbPanel className="pt-12">
          <ThumbSvg viewBox="0 0 120 40">
            <line
              stroke="currentColor"
              strokeOpacity={0.32}
              x1="70"
              x2="70"
              y1="-30"
              y2="40"
            />
            <SoftLine d="M0 32C12 30 20 20 32 22S52 30 64 20S88 6 120 8" />
            <circle
              className="fill-card text-primary"
              cx="70"
              cy="16.5"
              r="2.75"
              stroke="currentColor"
              strokeWidth={1.5}
            />
          </ThumbSvg>
        </ThumbPanel>
      </ThumbCard>
      <ThumbCard
        className="absolute top-3 right-[18%] w-auto max-w-none rounded-[10px] before:rounded-[9px]"
        withGradient={false}
      >
        <div className="flex flex-col gap-1.5 px-2.5 py-2">
          <Text className="w-8" variant="secondary" />
          <div className="flex items-center gap-1.5">
            <Dot accent className="size-1.5" />
            <Text className="w-10" />
          </div>
        </div>
      </ThumbCard>
    </div>
  );
}

function BrushIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-3">
        <ThumbSvg viewBox="0 0 120 40">
          <defs>
            <FadeGradient id="bk-ill-brush-fill" />
          </defs>
          <path
            d="M0 30C14 26 24 14 40 18S64 30 80 20S104 6 120 10L120 40L0 40Z"
            fill="url(#bk-ill-brush-fill)"
          />
          <SoftLine d="M0 30C14 26 24 14 40 18S64 30 80 20S104 6 120 10" />
        </ThumbSvg>
        <div className="relative h-7 overflow-hidden rounded-md bg-muted-foreground/6">
          <ThumbSvg
            className="absolute inset-0 h-full"
            preserveAspectRatio="none"
            viewBox="0 0 120 20"
          >
            <path
              d="M0 16C12 14 18 8 28 10S44 16 56 12S70 4 84 8S106 12 120 6"
              stroke="currentColor"
              strokeOpacity={0.32}
            />
          </ThumbSvg>
          <div className="absolute inset-y-0 right-[22%] left-[38%] border-primary/60 border-x-2 bg-primary/10">
            <div className="absolute top-1/2 -left-[3px] h-3 w-1 -translate-y-1/2 rounded-full bg-primary" />
            <div className="absolute top-1/2 -right-[3px] h-3 w-1 -translate-y-1/2 rounded-full bg-primary" />
          </div>
        </div>
      </ThumbPanel>
    </ThumbCard>
  );
}

function AxisIllustration({
  showX = true,
  showY = true,
}: {
  showX?: boolean;
  showY?: boolean;
}) {
  return (
    <ThumbCard>
      <ThumbPanel className="grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] gap-2">
        <div
          className={cn(
            "flex flex-col justify-between py-0.5",
            !showY && "opacity-30"
          )}
        >
          <Text className="w-4" variant={showY ? "main" : "secondary"} />
          <Text className="w-3" variant={showY ? "main" : "secondary"} />
          <Text className="w-4" variant={showY ? "main" : "secondary"} />
          <Text className="w-2.5" variant={showY ? "main" : "secondary"} />
        </div>
        <ThumbSvg viewBox="0 0 100 50">
          <path d="M0 0V50H100" stroke="currentColor" strokeOpacity={0.24} />
          <SoftLine
            accent={false}
            d="M0 40C10 36 18 24 28 26S44 34 56 24S76 8 100 10"
          />
        </ThumbSvg>
        <div />
        <div
          className={cn("flex justify-between px-1", !showX && "opacity-30")}
        >
          {["a", "b", "c", "d"].map((k) => (
            <Text
              className="w-4"
              key={k}
              variant={showX ? "main" : "secondary"}
            />
          ))}
        </div>
      </ThumbPanel>
    </ThumbCard>
  );
}

const CODE_LINES = [
  { indent: "", w: "w-[64%]", main: true, key: "1" },
  { indent: "ps-3", w: "w-[48%]", main: false, key: "2" },
  { indent: "ps-3", w: "w-[70%]", main: false, key: "3" },
  { indent: "ps-3", w: "w-[40%]", main: false, key: "4" },
  { indent: "", w: "w-3", main: true, key: "5" },
] as const;

function UseChartIllustration() {
  return (
    <ThumbCard className="max-w-44">
      <ThumbPanel className="flex flex-col gap-2.5 font-mono">
        <div className="flex items-center gap-1.5">
          <div className={cn("h-1.5 w-6 rounded-full", ACCENT_BG)} />
          <Text className="w-[40%]" />
        </div>
        {CODE_LINES.map((line) => (
          <div className={line.indent} key={line.key}>
            <Text
              className={line.w}
              variant={line.main ? "main" : "secondary"}
            />
          </div>
        ))}
      </ThumbPanel>
    </ThumbCard>
  );
}

function CustomIndicatorIllustration() {
  return (
    <ThumbCard>
      <ThumbPanel className="flex flex-col gap-4">
        <ThumbHeader />
        <ThumbSvg viewBox="0 0 120 50">
          <rect
            fill="currentColor"
            fillOpacity={0.08}
            height="50"
            rx="2"
            width="14"
            x="57"
            y="0"
          />
          <SoftLine
            accent={false}
            d="M0 38C12 34 20 24 32 26S52 34 64 22S88 12 100 14S114 18 120 12"
          />
          <path
            className="fill-card text-primary"
            d="M64 15.5L70.5 22L64 28.5L57.5 22Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth={1.5}
          />
        </ThumbSvg>
      </ThumbPanel>
    </ThumbCard>
  );
}

export const utilityIllustrations: Record<string, () => ReactNode> = {
  axis: () => <AxisIllustration />,
  background: BackgroundIllustration,
  brush: BrushIllustration,
  "custom-indicator": CustomIndicatorIllustration,
  grid: GridIllustration,
  legend: LegendIllustration,
  markers: MarkersIllustration,
  "projection-line": ProjectionLineIllustration,
  "reference-area": ReferenceAreaIllustration,
  tooltip: TooltipIllustration,
  "trend-line": TrendLineIllustration,
  "use-chart": UseChartIllustration,
  "x-axis": () => <AxisIllustration showY={false} />,
  "y-axis": () => <AxisIllustration showX={false} />,
};
