"use client";

import type { SankeyNode as SankeyNodeType } from "d3-sankey";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type SankeyLinkDatum,
  type SankeyNodeDatum,
  useSankey,
} from "./sankey-context";

// Helper to get node index from link source/target
type NodeOrIndex = SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum> | number;

function getNodeIndex(nodeOrIndex: NodeOrIndex): number | undefined {
  if (typeof nodeOrIndex === "number") {
    return nodeOrIndex;
  }
  return nodeOrIndex.index;
}

export interface SankeyNodeProps {
  /** Fill color for nodes. Default: uses theme colors */
  fill?: string;
  /** Corner radius for nodes. Default: 4 */
  lineCap?: number;
  /** Opacity when another node/link is hovered. Default: 0.4 */
  fadedOpacity?: number;
  /** Show node labels. Default: true */
  showLabels?: boolean;
  /** Custom node color function */
  getNodeColor?: (
    node: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>,
    index: number
  ) => string;
}

interface AnimatedNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rx: number;
  index: number;
  totalNodes: number;
  isFaded: boolean;
  fadedOpacity: number;
  animationDuration: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  name: string;
  value: number;
  isLeftSide: boolean;
  showLabels: boolean;
}

function AnimatedNode({
  x,
  y,
  width,
  height,
  fill,
  rx,
  index,
  totalNodes,
  isFaded,
  fadedOpacity,
  animationDuration,
  onMouseEnter,
  onMouseLeave,
  name,
  value,
  isLeftSide,
  showLabels,
}: AnimatedNodeProps) {
  const [isAnimated, setIsAnimated] = useState(false);
  const [showNameLabel, setShowNameLabel] = useState(false);
  const [showValueLabel, setShowValueLabel] = useState(false);

  // Nodes animate during first 60% of total duration
  const nodeAnimDuration = animationDuration * 0.6;
  // Stagger delay based on node index
  const staggerDelay = (index / totalNodes) * nodeAnimDuration * 0.4;
  const nodeDuration = nodeAnimDuration * 0.6;

  // Label delays - staggered after node appears
  const nameLabelDelay = staggerDelay + nodeDuration * 0.3;
  const valueLabelDelay = nameLabelDelay + 60; // 60ms after name label

  useEffect(() => {
    const nodeTimeout = setTimeout(() => {
      setIsAnimated(true);
    }, staggerDelay);

    const nameTimeout = setTimeout(() => {
      setShowNameLabel(true);
    }, nameLabelDelay);

    const valueTimeout = setTimeout(() => {
      setShowValueLabel(true);
    }, valueLabelDelay);

    return () => {
      clearTimeout(nodeTimeout);
      clearTimeout(nameTimeout);
      clearTimeout(valueTimeout);
    };
  }, [staggerDelay, nameLabelDelay, valueLabelDelay]);

  // Calculate opacity - instant transitions for hover
  const getOpacity = () => {
    if (!isAnimated) {
      return 0;
    }
    if (isFaded) {
      return fadedOpacity;
    }
    return 1;
  };

  // Calculate target X positions for labels
  const getNameLabelX = () => {
    if (!showNameLabel) {
      return isLeftSide ? x + 8 : x + width - 8;
    }
    return isLeftSide ? x - 12 : x + width + 12;
  };

  const getValueLabelX = () => {
    if (!showValueLabel) {
      return isLeftSide ? x + 8 : x + width - 8;
    }
    return isLeftSide ? x - 12 : x + width + 12;
  };

  const getNameOpacity = () => {
    if (!showNameLabel) {
      return 0;
    }
    if (isFaded) {
      return fadedOpacity;
    }
    return 1;
  };

  const getValueOpacity = () => {
    if (!showValueLabel) {
      return 0;
    }
    return isFaded ? fadedOpacity * 0.8 : 0.6;
  };

  const nameLabelX = getNameLabelX();
  const valueLabelX = getValueLabelX();
  const nameOpacity = getNameOpacity();
  const valueOpacity = getValueOpacity();

  // Use Framer Motion transitions - same as links: 180ms ease-out
  const hoverTransition = { duration: 0.18, ease: "easeOut" as const };
  const nodeTransition = {
    duration: nodeDuration / 1000,
    ease: "easeOut" as const,
  };
  const labelTransition = {
    duration: 0.25,
    ease: "easeOut" as const,
  };
  const currentNodeTransition = isAnimated ? hoverTransition : nodeTransition;
  const currentNameTransition = showNameLabel
    ? hoverTransition
    : labelTransition;
  const currentValueTransition = showValueLabel
    ? hoverTransition
    : labelTransition;

  return (
    <motion.g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "pointer" }}
    >
      <motion.rect
        animate={{
          opacity: getOpacity(),
          scaleY: isAnimated ? 1 : 0,
        }}
        fill={fill}
        height={height}
        initial={{
          opacity: 0,
          scaleY: 0,
        }}
        rx={rx}
        ry={rx}
        style={{ originY: 0.5 }}
        transition={currentNodeTransition}
        width={width}
        x={x}
        y={y}
      />
      {showLabels && (
        <>
          <motion.text
            animate={{
              opacity: nameOpacity,
              x: nameLabelX,
            }}
            className="fill-foreground font-medium text-[13px]"
            dy="0.35em"
            initial={{ opacity: 0, x: isLeftSide ? x + 8 : x + width - 8 }}
            textAnchor={isLeftSide ? "end" : "start"}
            transition={currentNameTransition}
            y={y + height / 2}
          >
            {name}
          </motion.text>
          <motion.text
            animate={{
              opacity: valueOpacity,
              x: valueLabelX,
            }}
            className="fill-foreground text-[11px]"
            dy="0.35em"
            initial={{ opacity: 0, x: isLeftSide ? x + 8 : x + width - 8 }}
            textAnchor={isLeftSide ? "end" : "start"}
            transition={currentValueTransition}
            y={y + height / 2 + 16}
          >
            {value.toLocaleString()} sessions
          </motion.text>
        </>
      )}
    </motion.g>
  );
}

export function SankeyNode({
  fill,
  lineCap = 4,
  fadedOpacity = 0.4,
  showLabels = true,
  getNodeColor: getNodeColorProp,
}: SankeyNodeProps) {
  const {
    nodes,
    links,
    width,
    margin,
    hoveredNodeIndex,
    hoveredLinkIndex,
    setHoveredNodeIndex,
    setTooltipData,
    animationDuration,
  } = useSankey();

  const sourceColors = useMemo(
    () => ["#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#818cf8", "#7c3aed"],
    []
  );
  const landingColors = useMemo(
    () => ["#06b6d4", "#14b8a6", "#22c55e", "#10b981", "#0ea5e9"],
    []
  );
  const outcomeColors = useMemo(() => ["#22c55e", "#eab308", "#ef4444"], []);

  // Get color for a node
  const getColor = useCallback(
    (
      node: SankeyNodeType<SankeyNodeDatum, SankeyLinkDatum>,
      index: number
    ): string => {
      if (fill) {
        return fill;
      }
      if (getNodeColorProp) {
        return getNodeColorProp(node, index);
      }

      const category = node.category;
      if (category === "source") {
        return (
          sourceColors[index % sourceColors.length] ??
          sourceColors[0] ??
          "#6366f1"
        );
      }
      if (category === "landing") {
        return (
          landingColors[(index - 6) % landingColors.length] ??
          landingColors[0] ??
          "#06b6d4"
        );
      }
      return (
        outcomeColors[(index - 11) % outcomeColors.length] ??
        outcomeColors[0] ??
        "#22c55e"
      );
    },
    [fill, getNodeColorProp, sourceColors, landingColors, outcomeColors]
  );

  // Check if a node is connected to the hovered element
  const isNodeConnected = useCallback(
    (nodeIndex: number) => {
      if (hoveredNodeIndex !== null) {
        if (hoveredNodeIndex === nodeIndex) {
          return true;
        }
        return links.some((link) => {
          const sIdx = getNodeIndex(link.source as NodeOrIndex);
          const tIdx = getNodeIndex(link.target as NodeOrIndex);
          return (
            (sIdx === hoveredNodeIndex && tIdx === nodeIndex) ||
            (tIdx === hoveredNodeIndex && sIdx === nodeIndex)
          );
        });
      }
      if (hoveredLinkIndex !== null) {
        const link = links[hoveredLinkIndex];
        if (!link) {
          return false;
        }
        const sIdx = getNodeIndex(link.source as NodeOrIndex);
        const tIdx = getNodeIndex(link.target as NodeOrIndex);
        return sIdx === nodeIndex || tIdx === nodeIndex;
      }
      return false;
    },
    [hoveredNodeIndex, hoveredLinkIndex, links]
  );

  const isAnyHovered = hoveredNodeIndex !== null || hoveredLinkIndex !== null;
  const innerWidth = width - margin.left - margin.right;

  return (
    <g className="sankey-nodes">
      {nodes.map((node, index) => {
        const nodeX = node.x0 ?? 0;
        const nodeY = node.y0 ?? 0;
        const nodeWidth = (node.x1 ?? 0) - nodeX;
        const nodeHeight = (node.y1 ?? 0) - nodeY;

        const isConnected = isNodeConnected(index);
        const isFaded = isAnyHovered && !isConnected;
        const isLeftSide = nodeX < innerWidth / 2;

        let displayValue = 0;
        for (const l of links) {
          const sIdx = getNodeIndex(l.source as NodeOrIndex);
          const tIdx = getNodeIndex(l.target as NodeOrIndex);
          if (node.category === "source" && sIdx === index) {
            displayValue += l.value;
          } else if (node.category !== "source" && tIdx === index) {
            displayValue += l.value;
          }
        }

        const handleMouseEnter = () => {
          setHoveredNodeIndex(index);
          setTooltipData({
            type: "node",
            nodeIndex: index,
            x: 0,
            y: 0,
            data: node,
          });
        };

        const handleMouseLeave = () => {
          setHoveredNodeIndex(null);
          setTooltipData(null);
        };

        return (
          <AnimatedNode
            animationDuration={animationDuration}
            fadedOpacity={fadedOpacity}
            fill={getColor(node, index)}
            height={nodeHeight}
            index={index}
            isFaded={isFaded}
            isLeftSide={isLeftSide}
            key={`node-${node.name}`}
            name={node.name}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            rx={lineCap}
            showLabels={showLabels}
            totalNodes={nodes.length}
            value={displayValue}
            width={nodeWidth}
            x={nodeX}
            y={nodeY}
          />
        );
      })}
    </g>
  );
}

SankeyNode.displayName = "SankeyNode";

export default SankeyNode;
