"use client";

import {
  type Margin,
  PatternLines,
  SankeyChart,
  SankeyLink,
  SankeyNode,
  SankeyTooltip,
} from "@bklitui/ui/charts";
import { CHART_EXAMPLE_MARGIN_PX } from "@/lib/chart-example-margin";
import type { LabVariant } from "./types";

const EXAMPLES = "chart-examples.tsx";
const DOCS = "docs/sankey-pattern-demo.tsx";

/** `createChartExamplePreview` merges this under the example's own margin. */
const EXAMPLE_MARGIN: Margin = {
  top: CHART_EXAMPLE_MARGIN_PX.top,
  right: CHART_EXAMPLE_MARGIN_PX.side,
  bottom: CHART_EXAMPLE_MARGIN_PX.bottom,
  left: CHART_EXAMPLE_MARGIN_PX.side,
};

/** `SANKEY_LABELED_EXAMPLE_MARGIN` (overrides every side of EXAMPLE_MARGIN). */
const LABELED_MARGIN: Margin = {
  top: 20,
  right: 56,
  bottom: 40,
  left: 56,
};

/** `SankeyLabeledExampleChart` wrapper. */
const LABELED_WRAPPER_CLASS = "px-2 py-1 sm:px-4";

// Data copied verbatim from the sources.
const sankeySimple = {
  nodes: [
    { name: "A", category: "source" as const },
    { name: "B", category: "source" as const },
    { name: "X", category: "landing" as const },
    { name: "Y", category: "landing" as const },
    { name: "Z", category: "outcome" as const },
  ],
  links: [
    { source: 0, target: 2, value: 40 },
    { source: 0, target: 3, value: 20 },
    { source: 1, target: 2, value: 30 },
    { source: 1, target: 3, value: 35 },
    { source: 2, target: 4, value: 70 },
    { source: 3, target: 4, value: 55 },
  ],
};

const sankeyAnalytics = {
  nodes: [
    { name: "Organic", category: "source" as const },
    { name: "Paid", category: "source" as const },
    { name: "Social", category: "source" as const },
    { name: "Direct", category: "source" as const },
    { name: "Blog", category: "landing" as const },
    { name: "Pricing", category: "landing" as const },
    { name: "Product", category: "landing" as const },
    { name: "Converted", category: "outcome" as const },
    { name: "Bounced", category: "outcome" as const },
  ],
  links: [
    { source: 0, target: 4, value: 4200 },
    { source: 0, target: 5, value: 1500 },
    { source: 1, target: 5, value: 3100 },
    { source: 1, target: 6, value: 2200 },
    { source: 2, target: 4, value: 2800 },
    { source: 2, target: 6, value: 600 },
    { source: 3, target: 5, value: 1800 },
    { source: 3, target: 6, value: 1100 },
    { source: 4, target: 7, value: 3500 },
    { source: 4, target: 8, value: 3500 },
    { source: 5, target: 7, value: 4200 },
    { source: 5, target: 8, value: 2200 },
    { source: 6, target: 7, value: 2500 },
    { source: 6, target: 8, value: 1400 },
  ],
};

/** 14-node set shared by sankey-chart.mdx and sankey-pattern-demo.tsx. */
const analyticsData = {
  nodes: [
    { name: "Organic Search", category: "source" as const },
    { name: "Paid Search", category: "source" as const },
    { name: "Paid Social", category: "source" as const },
    { name: "Email", category: "source" as const },
    { name: "Referral", category: "source" as const },
    { name: "Direct", category: "source" as const },
    { name: "Blog", category: "landing" as const },
    { name: "Pricing", category: "landing" as const },
    { name: "Product", category: "landing" as const },
    { name: "Docs", category: "landing" as const },
    { name: "Homepage", category: "landing" as const },
    { name: "Converted", category: "outcome" as const },
    { name: "Engaged", category: "outcome" as const },
    { name: "Bounced", category: "outcome" as const },
  ],
  links: [
    { source: 0, target: 6, value: 4200 },
    { source: 0, target: 9, value: 2800 },
    { source: 0, target: 7, value: 1500 },
    { source: 1, target: 7, value: 3100 },
    { source: 1, target: 8, value: 2200 },
    { source: 1, target: 6, value: 800 },
    { source: 2, target: 6, value: 2800 },
    { source: 2, target: 10, value: 1900 },
    { source: 2, target: 8, value: 600 },
    { source: 3, target: 7, value: 2100 },
    { source: 3, target: 8, value: 1400 },
    { source: 3, target: 6, value: 900 },
    { source: 4, target: 6, value: 1800 },
    { source: 4, target: 9, value: 1200 },
    { source: 4, target: 7, value: 700 },
    { source: 5, target: 10, value: 3500 },
    { source: 5, target: 7, value: 1800 },
    { source: 5, target: 8, value: 1100 },
    { source: 6, target: 11, value: 2100 },
    { source: 6, target: 12, value: 4800 },
    { source: 6, target: 13, value: 3600 },
    { source: 7, target: 11, value: 4500 },
    { source: 7, target: 12, value: 3200 },
    { source: 7, target: 13, value: 1500 },
    { source: 8, target: 11, value: 2800 },
    { source: 8, target: 12, value: 1900 },
    { source: 8, target: 13, value: 600 },
    { source: 9, target: 11, value: 800 },
    { source: 9, target: 12, value: 2400 },
    { source: 9, target: 13, value: 800 },
    { source: 10, target: 11, value: 1200 },
    { source: 10, target: 12, value: 1800 },
    { source: 10, target: 13, value: 2400 },
  ],
};

const outcomePatterns = (
  <>
    <PatternLines
      height={6}
      id="converted"
      orientation={["diagonal"]}
      stroke="#22c55e"
      strokeWidth={2}
      width={6}
    />
    <PatternLines
      height={6}
      id="engaged"
      orientation={["diagonal"]}
      stroke="#eab308"
      strokeWidth={2}
      width={6}
    />
    <PatternLines
      height={6}
      id="bounced"
      orientation={["diagonal"]}
      stroke="#ef4444"
      strokeWidth={2}
      width={6}
    />
  </>
);

function getOutcomePattern(link: { target: number | { name?: string } }) {
  const target =
    typeof link.target === "number"
      ? analyticsData.nodes[link.target]
      : link.target;
  if (target?.name === "Converted") {
    return "converted";
  }
  if (target?.name === "Engaged") {
    return "engaged";
  }
  if (target?.name === "Bounced") {
    return "bounced";
  }
  return null;
}

const CUSTOM_PALETTE = ["#0ea5e9", "#a855f7", "#f59e0b", "#10b981", "#ef4444"];

function paletteColor(_: unknown, index: number): string {
  return CUSTOM_PALETTE[index % CUSTOM_PALETTE.length] ?? "#0ea5e9";
}

export const SANKEY_VARIANTS: LabVariant[] = [
  {
    id: "default",
    label: "Sankey",
    source: `${EXAMPLES}: Sankey Chart`,
    exercises: "9 nodes, 4 / 3, vertical labels, gradient links, lineCap 4",
    kind: "single",
    render: () => {
      return (
        <div className={LABELED_WRAPPER_CLASS}>
          <SankeyChart
            aspectRatio="4 / 3"
            data={sankeyAnalytics}
            margin={LABELED_MARGIN}
            nodePadding={24}
            nodeWidth={16}
          >
            <SankeyLink />
            <SankeyNode labelOrientation="vertical" lineCap={4} />
            <SankeyTooltip />
          </SankeyChart>
        </div>
      );
    },
  },
  {
    id: "no-labels",
    label: "No labels",
    source: `${EXAMPLES}: Sankey Chart - No Labels (also ${DOCS}: SankeyNoLabelsDemo)`,
    exercises: "showLabels={false}, example margin (8 px sides)",
    kind: "single",
    render: () => {
      return (
        <SankeyChart
          aspectRatio="4 / 3"
          data={sankeyAnalytics}
          margin={EXAMPLE_MARGIN}
          nodePadding={24}
          nodeWidth={16}
        >
          <SankeyLink />
          <SankeyNode lineCap={4} showLabels={false} />
          <SankeyTooltip />
        </SankeyChart>
      );
    },
  },
  {
    id: "simple",
    label: "Simple",
    source: `${EXAMPLES}: Sankey Chart - Simple`,
    exercises: "5 nodes, nodeWidth 12, nodePadding 20, strokeOpacity 0.5",
    kind: "single",
    render: () => {
      return (
        <div className={LABELED_WRAPPER_CLASS}>
          <SankeyChart
            aspectRatio="4 / 3"
            data={sankeySimple}
            margin={LABELED_MARGIN}
            nodePadding={20}
            nodeWidth={12}
          >
            <SankeyLink strokeOpacity={0.5} />
            <SankeyNode labelOrientation="vertical" lineCap={3} />
            <SankeyTooltip />
          </SankeyChart>
        </div>
      );
    },
  },
  {
    id: "solid-links",
    label: "Solid links",
    source: `${EXAMPLES}: Sankey Chart - Solid Links`,
    exercises: "useGradient={false}, solid stroke",
    kind: "single",
    render: () => {
      return (
        <div className={LABELED_WRAPPER_CLASS}>
          <SankeyChart
            aspectRatio="4 / 3"
            data={sankeyAnalytics}
            margin={LABELED_MARGIN}
            nodePadding={24}
            nodeWidth={16}
          >
            <SankeyLink
              stroke="var(--chart-3)"
              strokeOpacity={0.3}
              useGradient={false}
            />
            <SankeyNode labelOrientation="vertical" lineCap={4} />
            <SankeyTooltip />
          </SankeyChart>
        </div>
      );
    },
  },
  {
    id: "interactive-hero",
    label: "Interactive hero",
    source: `${EXAMPLES}: Sankey Chart - Interactive (SankeyHeroInner)`,
    exercises: "Wide 5 / 2 aspect of the default layout",
    width: 760,
    height: 340,
    kind: "single",
    render: () => {
      return (
        <div className={LABELED_WRAPPER_CLASS}>
          <SankeyChart
            aspectRatio="5 / 2"
            data={sankeyAnalytics}
            margin={LABELED_MARGIN}
            nodePadding={24}
            nodeWidth={16}
          >
            <SankeyLink />
            <SankeyNode labelOrientation="vertical" lineCap={4} />
            <SankeyTooltip />
          </SankeyChart>
        </div>
      );
    },
  },
  {
    id: "docs-hero",
    label: "Docs hero",
    source: "sankey-chart.mdx: ComponentPreview",
    exercises: "14 nodes, 16 / 9, default margin, vertical labels",
    kind: "single",
    render: () => {
      return (
        <div className="w-full">
          <SankeyChart
            aspectRatio="16 / 9"
            data={analyticsData}
            nodePadding={24}
            nodeWidth={16}
          >
            <SankeyLink />
            <SankeyNode labelOrientation="vertical" lineCap={4} />
            <SankeyTooltip />
          </SankeyChart>
        </div>
      );
    },
  },
  {
    id: "patterns",
    label: "Pattern links",
    source: `${DOCS}: SankeyPatternDemo`,
    exercises:
      "patterns + getLinkPattern on outcome links, horizontal labels (default)",
    kind: "single",
    render: () => {
      return (
        <SankeyChart
          aspectRatio="16 / 9"
          data={analyticsData}
          nodePadding={24}
          nodeWidth={16}
        >
          <SankeyLink
            getLinkPattern={getOutcomePattern}
            patterns={outcomePatterns}
          />
          <SankeyNode lineCap={4} />
          <SankeyTooltip />
        </SankeyChart>
      );
    },
  },
  {
    id: "custom-colors",
    label: "Custom colors",
    source:
      "sankey-chart.mdx SankeyNode/SankeyLink props: getNodeColor, getLinkColor, showValueLabels",
    exercises: "Callback colours, no value labels, horizontal labels",
    kind: "single",
    render: () => {
      return (
        <SankeyChart
          aspectRatio="16 / 9"
          data={sankeyAnalytics}
          margin={{ top: 20, right: 100, bottom: 20, left: 100 }}
        >
          <SankeyLink getLinkColor={paletteColor} />
          <SankeyNode getNodeColor={paletteColor} showValueLabels={false} />
          <SankeyTooltip />
        </SankeyChart>
      );
    },
  },
  {
    id: "fast-enter",
    label: "animationDuration 500",
    source: "sankey-chart.mdx SankeyChart props: animationDuration",
    exercises: "Shorter enter timeline (SankeyChart-owned reveal)",
    kind: "single",
    render: () => {
      return (
        <SankeyChart
          animationDuration={500}
          aspectRatio="16 / 9"
          data={sankeySimple}
          margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
        >
          <SankeyLink />
          <SankeyNode />
          <SankeyTooltip />
        </SankeyChart>
      );
    },
  },
];
