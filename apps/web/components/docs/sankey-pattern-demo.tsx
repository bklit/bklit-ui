"use client";

import {
  PatternLines,
  SankeyChart,
  SankeyLink,
  SankeyNode,
  SankeyTooltip,
} from "@bklitui/ui/charts";

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

export function SankeyPatternDemo() {
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
}

export function SankeyNoLabelsDemo() {
  return (
    <SankeyChart
      aspectRatio="16 / 9"
      data={analyticsData}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      nodePadding={24}
      nodeWidth={16}
    >
      <SankeyLink />
      <SankeyNode lineCap={4} showLabels={false} />
      <SankeyTooltip />
    </SankeyChart>
  );
}
