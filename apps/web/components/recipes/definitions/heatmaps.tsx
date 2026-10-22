"use client";

import {
  buildHeatmapRowOpacity,
  HEATMAP_MONTHS_SIX,
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  HeatmapSeparator,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapYAxis,
} from "@bklitui/ui/charts";
import type { ReactNode } from "react";
import { getHeatmapDemoData } from "@/lib/heatmap-demo-data";
import type { Recipe } from "@/lib/recipes/types";

const heatmapData = getHeatmapDemoData(0, HEATMAP_MONTHS_SIX);
const HEATMAP_MARGIN = { top: 28, right: 12, bottom: 0, left: 44 };
const SEPARATOR_FADE = {
  from: "var(--muted-foreground)",
  via: "var(--muted-foreground)",
  to: "var(--muted-foreground)",
  fromOpacity: 0,
  viaOpacity: 0.5,
  toOpacity: 0,
};
const WEEKEND_ROWS = buildHeatmapRowOpacity((row) => row >= 5, 0.35);

/* -------------------------------------------------------------------------- */
/* Dot calendar                                                               */
/* -------------------------------------------------------------------------- */

/** Preview-only: keep cells legible on phones by scrolling instead of shrinking. */
function PhoneScroll({ children }: { children: ReactNode }) {
  return (
    <div className="no-scrollbar w-full overflow-x-auto">
      <div className="min-w-[540px]">{children}</div>
    </div>
  );
}

function DotCalendarPreview() {
  return (
    <PhoneScroll>
      <HeatmapInteractionProvider>
        <HeatmapInteractionBoundary>
          <div className="flex w-full flex-col items-stretch gap-2 pt-5">
            <HeatmapChart
              className="w-full min-w-0"
              data={heatmapData}
              gap={3}
              layout="fluid"
              margin={HEATMAP_MARGIN}
            >
              <HeatmapCells
                cornerRadius={999}
                inactiveOpacity={0.8}
                inactiveScale={0.94}
              />
              <HeatmapSeparator
                gradient={SEPARATOR_FADE}
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
        </HeatmapInteractionBoundary>
      </HeatmapInteractionProvider>
    </PhoneScroll>
  );
}

export const heatmapDotCalendar: Recipe = {
  id: "heatmap-dot-calendar",
  title: "Dot calendar",
  category: "heatmaps",
  description:
    "Round cells, quarter dividers that fade at both ends, and single-letter day labels.",
  look: "a contribution calendar drawn with round dots instead of squares, separated into quarters by thin vertical dividers that fade in and out at their ends (labelled Q1–Q4 above the grid in `--chart-3`), with single-letter day labels on every row. Hovering a cell or a legend swatch gently shrinks and dims everything else; the legend uses the same round swatches.",
  charts: [
    {
      id: "heatmap",
      label: "Heatmap",
      rootComponent: "HeatmapChart",
      Preview: DotCalendarPreview,
      install: ["heatmap-chart"],
      steps: [
        "Wrap the chart and its legend in `<HeatmapInteractionProvider><HeatmapInteractionBoundary>…</HeatmapInteractionBoundary></HeatmapInteractionProvider>` if they aren't already, so hover dimming stays in sync.",
        "On `<HeatmapCells>` set `cornerRadius={999}` (round dots), `inactiveOpacity={0.8}` and `inactiveScale={0.94}`; pass the same three props to `<HeatmapLegend>`.",
        'Add `<HeatmapSeparator groupBy="quarter" showLabels strokeStyle="solid" spacing={20} startOffset={-20} labelClassName="text-[var(--chart-3)]" gradient={{ from: "var(--muted-foreground)", via: "var(--muted-foreground)", to: "var(--muted-foreground)", fromOpacity: 0, viaOpacity: 0.5, toOpacity: 0 }} />` after `<HeatmapCells>` — the gradient fades each divider out at the top and bottom.',
        'Set `<HeatmapYAxis labelFormat="initial" tickFilter="all" />` for single-letter labels on every row.',
        "Quarter labels paint above the plot, so give the wrapper ~20px of top padding (e.g. `pt-5`) and keep `margin.top` ≥ 28.",
      ],
      code: `"use client";

import {
  type HeatmapColumn,
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  HeatmapSeparator,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapYAxis,
} from "@/components/charts/heatmap";

const separatorFade = {
  from: "var(--muted-foreground)",
  via: "var(--muted-foreground)",
  to: "var(--muted-foreground)",
  fromOpacity: 0,
  viaOpacity: 0.5,
  toOpacity: 0,
};

export function ContributionsCalendar({ data }: { data: HeatmapColumn[] }) {
  return (
    <HeatmapInteractionProvider>
      <HeatmapInteractionBoundary>
        <div className="flex w-full flex-col items-stretch gap-2 pt-5">
          <HeatmapChart
            className="w-full min-w-0"
            data={data}
            gap={3}
            layout="fluid"
            margin={{ top: 28, right: 12, bottom: 0, left: 44 }}
          >
            <HeatmapCells
              cornerRadius={999}
              inactiveOpacity={0.8}
              inactiveScale={0.94}
            />
            <HeatmapSeparator
              gradient={separatorFade}
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
      </HeatmapInteractionBoundary>
    </HeatmapInteractionProvider>
  );
}
`,
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Workweek focus                                                             */
/* -------------------------------------------------------------------------- */

function WorkweekPreview() {
  return (
    <PhoneScroll>
      <HeatmapInteractionProvider>
        <HeatmapInteractionBoundary>
          <div className="flex w-full flex-col items-stretch gap-2">
            <HeatmapChart
              className="w-full min-w-0"
              data={heatmapData}
              gap={3}
              layout="fluid"
              margin={HEATMAP_MARGIN}
              weekStartDay={1}
            >
              <HeatmapCells cornerRadius={2} rowOpacity={WEEKEND_ROWS} />
              <HeatmapXAxis />
              <HeatmapYAxis
                labelFormat="initial"
                rowOpacity={WEEKEND_ROWS}
                tickFilter="all"
              />
              <HeatmapTooltip />
            </HeatmapChart>
            <HeatmapLegend align="center" cornerRadius={2} gap={3} />
          </div>
        </HeatmapInteractionBoundary>
      </HeatmapInteractionProvider>
    </PhoneScroll>
  );
}

export const heatmapWorkweek: Recipe = {
  id: "heatmap-workweek",
  title: "Workweek focus",
  category: "heatmaps",
  description:
    "Start weeks on Monday and fade the weekend rows so the working week leads.",
  look: "a contribution calendar whose weeks start on Monday (M T W T F S S, a letter on every row), with the Saturday and Sunday rows — cells and their labels — faded to 35% opacity so the five working days carry the pattern. Cells are softly rounded squares (2px radius) and the legend matches.",
  charts: [
    {
      id: "heatmap",
      label: "Heatmap",
      rootComponent: "HeatmapChart",
      Preview: WorkweekPreview,
      install: ["heatmap-chart"],
      steps: [
        "Set `weekStartDay={1}` on `<HeatmapChart>` so rows run Monday → Sunday (rows 5 and 6 are then the weekend). Skip this step if the product's locale starts weeks on another day — and pick the matching weekend rows below.",
        "Create `const weekendRows = buildHeatmapRowOpacity((row) => row >= 5, 0.35);` (from `@/components/charts/heatmap`) at module scope.",
        'Pass `rowOpacity={weekendRows}` to both `<HeatmapCells>` and `<HeatmapYAxis>`, and set `<HeatmapYAxis labelFormat="initial" tickFilter="all" />`.',
        "Use `cornerRadius={2}` on `<HeatmapCells>` and `<HeatmapLegend>`. Keep `<HeatmapXAxis />`, `<HeatmapTooltip />` and the interaction provider/boundary.",
      ],
      code: `"use client";

import {
  buildHeatmapRowOpacity,
  type HeatmapColumn,
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapYAxis,
} from "@/components/charts/heatmap";

// Rows 5 and 6 are Saturday and Sunday when weeks start on Monday.
const weekendRows = buildHeatmapRowOpacity((row) => row >= 5, 0.35);

export function ContributionsCalendar({ data }: { data: HeatmapColumn[] }) {
  return (
    <HeatmapInteractionProvider>
      <HeatmapInteractionBoundary>
        <div className="flex w-full flex-col items-stretch gap-2">
          <HeatmapChart
            className="w-full min-w-0"
            data={data}
            gap={3}
            layout="fluid"
            margin={{ top: 28, right: 12, bottom: 0, left: 44 }}
            weekStartDay={1}
          >
            <HeatmapCells cornerRadius={2} rowOpacity={weekendRows} />
            <HeatmapXAxis />
            <HeatmapYAxis
              labelFormat="initial"
              rowOpacity={weekendRows}
              tickFilter="all"
            />
            <HeatmapTooltip />
          </HeatmapChart>
          <HeatmapLegend align="center" cornerRadius={2} gap={3} />
        </div>
      </HeatmapInteractionBoundary>
    </HeatmapInteractionProvider>
  );
}
`,
    },
  ],
};
