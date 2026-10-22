"use client";

import type { SankeyLink, SankeyNode } from "d3-sankey";
import { intFmt } from "../chart-formatters";
import { TooltipBox } from "../tooltip/tooltip-box";
import { TooltipContent, type TooltipRow } from "../tooltip/tooltip-content";
import {
  type SankeyLinkDatum,
  type SankeyNodeDatum,
  useSankey,
} from "./sankey-context";

// Helper to get node name from link source/target
type NodeOrIndex = SankeyNode<SankeyNodeDatum, SankeyLinkDatum> | number;

function getNodeName(nodeOrIndex: NodeOrIndex, fallbackIndex: number): string {
  if (typeof nodeOrIndex === "number") {
    return `Node ${nodeOrIndex}`;
  }
  return nodeOrIndex.name ?? `Node ${fallbackIndex}`;
}

export interface SankeyTooltipProps {
  /** Custom content renderer for node tooltips */
  nodeContent?: (props: {
    node: SankeyNode<SankeyNodeDatum, SankeyLinkDatum>;
    index: number;
  }) => React.ReactNode;
  /** Custom content renderer for link tooltips */
  linkContent?: (props: {
    link: SankeyLink<SankeyNodeDatum, SankeyLinkDatum>;
    index: number;
  }) => React.ReactNode;
  /** Value formatter function */
  formatValue?: (value: number) => string;
  /** Custom class name */
  className?: string;
  /** Inline styles merged onto the tooltip panel (e.g. background, backdrop blur). */
  panelStyle?: React.CSSProperties;
  /** Fade the panel out when hover ends. Default: true */
  exit?: boolean;
}

export function SankeyTooltip({
  nodeContent,
  linkContent,
  formatValue = intFmt,
  className = "",
  panelStyle,
  exit = true,
}: SankeyTooltipProps) {
  const {
    tooltipData,
    containerRef,
    width,
    height,
    margin,
    nodes,
    links,
    mousePos,
  } = useSankey();

  let x = 0;
  let y = 0;
  if (tooltipData) {
    // Use mouse position if available, otherwise fallback to anchor point
    x = mousePos ? mousePos.x : tooltipData.x + margin.left;
    y = mousePos ? mousePos.y : tooltipData.y + margin.top;
  }

  let body: React.ReactNode = null;

  const node =
    tooltipData?.type === "node" && tooltipData.nodeIndex !== undefined
      ? nodes[tooltipData.nodeIndex]
      : undefined;
  const link =
    tooltipData?.type === "link" && tooltipData.linkIndex !== undefined
      ? links[tooltipData.linkIndex]
      : undefined;

  if (node && tooltipData?.nodeIndex !== undefined) {
    body = nodeContent ? (
      nodeContent({ node, index: tooltipData.nodeIndex })
    ) : (
      <TooltipContent
        rows={[
          {
            color: "var(--chart-line-primary)",
            label: "Sessions",
            value: formatValue(node.value ?? 0),
          },
        ]}
        title={node.name}
      />
    );
  } else if (link && tooltipData?.linkIndex !== undefined) {
    const index = tooltipData.linkIndex;
    if (linkContent) {
      body = linkContent({ link, index });
    } else {
      const sourceName = getNodeName(link.source as NodeOrIndex, index);
      const targetName = getNodeName(link.target as NodeOrIndex, index);
      const rows: TooltipRow[] = [
        {
          color: "var(--chart-foreground-muted)",
          label: "Flow",
          value: formatValue(link.value),
        },
      ];
      body = (
        <TooltipContent rows={rows} title={`${sourceName} → ${targetName}`} />
      );
    }
  }

  // Always mounted so the panel can fade out; `visible` drives presence.
  return (
    <TooltipBox
      className={className}
      containerHeight={height}
      containerRef={containerRef}
      containerWidth={width}
      exit={exit}
      panelStyle={panelStyle}
      visible={body !== null}
      x={x}
      y={y}
    >
      {body}
    </TooltipBox>
  );
}

SankeyTooltip.displayName = "SankeyTooltip";

export default SankeyTooltip;
