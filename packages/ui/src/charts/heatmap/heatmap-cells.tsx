"use client";

import { Group } from "@visx/group";
import { HeatmapRect } from "@visx/heatmap";
import {
  animate,
  type MotionValue,
  motion,
  type Transition,
  useMotionValue,
} from "motion/react";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import type { ChartStatus } from "../chart-phase";
import { transitionWithDelay } from "../motion-utils";
import {
  computeHeatmapEnterFadeDelayMs,
  HEATMAP_DEFAULT_ENTER_EASE,
  HEATMAP_LOADING_BASE_CELL_OPACITY,
  HEATMAP_LOADING_CONCEAL_MS,
  heatmapLoadingCellParticipates,
  resolveHeatmapEnterFadeDurationSec,
} from "./heatmap-animation";
import { heatmapLevelCellFillOpacity } from "./heatmap-colors";
import {
  type HeatmapBin,
  type HeatmapColumn,
  useHeatmap,
  useHeatmapInteraction,
} from "./heatmap-context";
import { getHeatmapContributionLevel } from "./heatmap-utils";

const HEATMAP_FADED_OPACITY = 0.3;
const HEATMAP_HOVER_TRANSITION = { duration: 0.15, ease: "easeOut" as const };
const HEATMAP_CONCEAL_TRANSITION = {
  duration: HEATMAP_LOADING_CONCEAL_MS / 1000,
  ease: HEATMAP_DEFAULT_ENTER_EASE,
};

function computeHeatmapCellFaded(
  isCellHovering: boolean,
  isLevelHovering: boolean,
  hoveredCell: { column: number; row: number } | null,
  hoveredLegendLevel: number | null,
  cell: { column: number; row: number },
  count: number
): boolean {
  if (isCellHovering && hoveredCell) {
    return hoveredCell.column !== cell.column || hoveredCell.row !== cell.row;
  }
  if (isLevelHovering && hoveredLegendLevel !== null) {
    return getHeatmapContributionLevel(count) !== hoveredLegendLevel;
  }
  return false;
}

interface SyncCellLayerParams {
  animateCells: boolean;
  chartStatus: ChartStatus;
  dataOpacity: MotionValue<number>;
  isAwaitingLoadingConceal: boolean;
  isExitingToLoading: boolean;
  isLoadingResting: boolean;
  isReadyResting: boolean;
  isRevealActive: boolean;
  participates: boolean;
  pulseOpacity: MotionValue<number>;
  readyDataOpacity: number;
  shimmerOpacity: MotionValue<number>;
  showLoadingCellsLayer: boolean;
  showShimmerPulse: boolean;
  staggeredTransition: Transition;
}

function syncHeatmapCellLayerOpacities(params: SyncCellLayerParams) {
  const {
    animateCells,
    chartStatus,
    dataOpacity,
    isAwaitingLoadingConceal,
    isExitingToLoading,
    isLoadingResting,
    isReadyResting,
    isRevealActive,
    participates,
    pulseOpacity,
    readyDataOpacity,
    shimmerOpacity,
    showLoadingCellsLayer,
    showShimmerPulse,
    staggeredTransition,
  } = params;

  if (!animateCells) {
    if (isReadyResting) {
      dataOpacity.set(readyDataOpacity);
      shimmerOpacity.set(0);
      pulseOpacity.set(0);
    } else if (chartStatus === "loading") {
      dataOpacity.set(0);
      pulseOpacity.set(0);
      shimmerOpacity.set(
        participates && showLoadingCellsLayer
          ? 0
          : HEATMAP_LOADING_BASE_CELL_OPACITY
      );
    }
    return;
  }

  if (isLoadingResting) {
    animate(dataOpacity, 0, { duration: 0 });
    if (!showShimmerPulse) {
      animate(shimmerOpacity, HEATMAP_LOADING_BASE_CELL_OPACITY, {
        duration: 0,
      });
    }
    return;
  }

  if (isRevealActive) {
    pulseOpacity.set(0);
    shimmerOpacity.set(0);
    animate(dataOpacity, readyDataOpacity, staggeredTransition);
    return;
  }

  if (isAwaitingLoadingConceal || isExitingToLoading) {
    animate(dataOpacity, 0, HEATMAP_CONCEAL_TRANSITION);
    animate(shimmerOpacity, 0, { duration: 0 });
    return;
  }

  if (isReadyResting) {
    animate(dataOpacity, readyDataOpacity, HEATMAP_HOVER_TRANSITION);
    animate(shimmerOpacity, 0, { duration: 0 });
    pulseOpacity.set(0);
  }
}

export interface HeatmapCellsProps {
  /** Corner radius for each cell. Default: 2 */
  cornerRadius?: number;
  /** Override the default GitHub-style green color scale. */
  colorScale?: (count: number | null | undefined) => string;
  /** Opacity for non-hovered cells while a cell is hovered. Default: 0.3 */
  fadedOpacity?: number;
  /** Pointer hover + dimming. Default: true */
  interactive?: boolean;
}

interface HeatmapCellRectProps {
  cell: {
    column: number;
    row: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color?: string;
    opacity?: number;
  };
  bin: HeatmapBin;
  cornerRadius: number;
  interactive: boolean;
  fadedOpacity: number;
  isFaded: boolean;
  onEnter: (
    column: number,
    row: number,
    bin: HeatmapBin,
    x: number,
    y: number
  ) => void;
  onLeave: () => void;
}

const HeatmapMotionCell = memo(function HeatmapMotionCell({
  cell,
  bin,
  cornerRadius,
  fillScale,
  interactive,
  fadedOpacity,
  isFaded,
  onEnter,
  onLeave,
}: HeatmapCellRectProps & {
  fillScale: (count: number | null | undefined) => string;
}) {
  const {
    chartStatus,
    chartPhase,
    isLoaded,
    revealMode,
    revealEpoch,
    animationDuration,
    enterTransition,
    enterStaggerScale,
    animateCells,
    showLoadingCells: showLoadingCellsLayer,
    loadingCellMaxOpacity,
    loadingCellRandomness,
    levelStyles,
  } = useHeatmap();

  const levelStyle =
    levelStyles[getHeatmapContributionLevel(bin.count ?? 0)] ?? levelStyles[0];
  const targetFill = fillScale(bin.count);
  const emptyFill = fillScale(0);
  const patternFillOpacity = heatmapLevelCellFillOpacity(levelStyle);
  const dataOpacity = useMotionValue(0);
  /** Orchestration layer: conceal, static loading base. */
  const shimmerOpacity = useMotionValue(0);
  /** Pulse loop only — kept separate so stagger tweens don't break re-entry. */
  const pulseOpacity = useMotionValue(0);
  const wasShimmerPulsingRef = useRef(false);

  const isLoadingResting =
    chartStatus === "loading" && chartPhase === "loading";
  const isAwaitingLoadingConceal =
    chartStatus === "loading" && chartPhase === "ready";
  const isExitingToLoading = chartPhase === "exitingReady";
  const isRevealActive =
    chartPhase === "revealing" &&
    !isLoaded &&
    (revealMode === "fromLoading" || revealMode === "enter");
  const isReadyResting =
    chartStatus === "ready" && chartPhase === "ready" && isLoaded;

  const participates = useMemo(
    () =>
      heatmapLoadingCellParticipates(
        cell.column,
        cell.row,
        loadingCellRandomness
      ),
    [cell.column, cell.row, loadingCellRandomness]
  );

  const showShimmerPulse =
    animateCells && showLoadingCellsLayer && participates && isLoadingResting;

  const fadeDurationSec = resolveHeatmapEnterFadeDurationSec(
    enterTransition,
    animationDuration
  );
  const delayMs = computeHeatmapEnterFadeDelayMs({
    column: cell.column,
    row: cell.row,
    revealEpoch,
    animationDurationMs: animationDuration,
    enterStaggerScale,
    fadeDurationSec,
  });
  const staggeredTransition = transitionWithDelay(
    enterTransition,
    delayMs / 1000
  );

  const readyDataOpacity = isFaded ? fadedOpacity : 1;

  useEffect(() => {
    if (!showShimmerPulse) {
      wasShimmerPulsingRef.current = false;
      pulseOpacity.set(0);
      return;
    }

    const isFreshLoadingPulse =
      isLoadingResting && !wasShimmerPulsingRef.current;
    wasShimmerPulsingRef.current = true;

    if (isFreshLoadingPulse) {
      pulseOpacity.set(0);
    }

    let cancelled = false;
    let current: ReturnType<typeof animate> | undefined;

    const pulse = async () => {
      while (!cancelled) {
        const target = Math.random() * loadingCellMaxOpacity;
        const duration = 0.35 + Math.random() * 0.85;
        current = animate(pulseOpacity, target, {
          duration,
          ease: [0.45, 0, 0.55, 1],
        });

        try {
          await current;
        } catch {
          break;
        }

        if (cancelled) {
          break;
        }

        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 80 + Math.random() * 420);
        });
      }
    };

    pulse().catch(() => undefined);

    return () => {
      cancelled = true;
      current?.stop();
    };
  }, [isLoadingResting, loadingCellMaxOpacity, pulseOpacity, showShimmerPulse]);

  useEffect(() => {
    syncHeatmapCellLayerOpacities({
      animateCells,
      chartStatus,
      dataOpacity,
      isAwaitingLoadingConceal,
      isExitingToLoading,
      isLoadingResting,
      isReadyResting,
      isRevealActive,
      participates,
      pulseOpacity,
      readyDataOpacity,
      shimmerOpacity,
      showLoadingCellsLayer,
      showShimmerPulse,
      staggeredTransition,
    });
  }, [
    animateCells,
    chartStatus,
    dataOpacity,
    isAwaitingLoadingConceal,
    isExitingToLoading,
    isLoadingResting,
    isReadyResting,
    isRevealActive,
    participates,
    pulseOpacity,
    readyDataOpacity,
    shimmerOpacity,
    showLoadingCellsLayer,
    showShimmerPulse,
    staggeredTransition,
  ]);

  const cellProps = {
    className: "visx-heatmap-rect",
    height: cell.height,
    rx: cornerRadius,
    ry: cornerRadius,
    width: cell.width,
    x: cell.x,
    y: cell.y,
  };

  return (
    <g>
      <motion.rect
        {...cellProps}
        fill={targetFill}
        fillOpacity={(cell.opacity ?? 1) * patternFillOpacity}
        onPointerEnter={() =>
          onEnter(cell.column, cell.row, bin, cell.x, cell.y)
        }
        onPointerLeave={onLeave}
        style={{
          cursor: interactive ? "pointer" : undefined,
          opacity: dataOpacity,
        }}
      />
      <motion.rect
        {...cellProps}
        fill={emptyFill}
        pointerEvents="none"
        style={{
          opacity: showShimmerPulse ? pulseOpacity : shimmerOpacity,
        }}
      />
    </g>
  );
});

export const HeatmapCells = memo(function HeatmapCells({
  cornerRadius = 2,
  colorScale: colorScaleProp,
  fadedOpacity = HEATMAP_FADED_OPACITY,
  interactive = true,
}: HeatmapCellsProps) {
  const {
    data,
    binWidth,
    binHeight,
    gap,
    margin,
    xScale,
    yScale,
    chartStatus,
    colorScale: contextColorScale,
    fillScale: contextFillScale,
  } = useHeatmap();
  const colorScale = colorScaleProp ?? contextColorScale;
  const fillScale = contextFillScale;
  const cellsInteractive = interactive && chartStatus !== "loading";
  const {
    hoveredCell,
    hoveredLegendLevel,
    setHoveredCell,
    setHoveredLegendLevel,
    setTooltipData,
  } = useHeatmapInteraction();

  const handleCellEnter = useCallback(
    (column: number, row: number, bin: HeatmapBin, x: number, y: number) => {
      if (!cellsInteractive) {
        return;
      }

      setHoveredLegendLevel(null);
      setHoveredCell({ column, row });
      setTooltipData({
        column,
        row,
        count: bin.count,
        date: bin.date,
        x: margin.left + x + binWidth / 2,
        y: margin.top + y + binHeight / 2,
      });
    },
    [
      binHeight,
      binWidth,
      cellsInteractive,
      margin.left,
      margin.top,
      setHoveredCell,
      setHoveredLegendLevel,
      setTooltipData,
    ]
  );

  const handleCellLeave = useCallback(() => {
    if (!cellsInteractive) {
      return;
    }

    setHoveredCell(null);
    setTooltipData(null);
  }, [cellsInteractive, setHoveredCell, setTooltipData]);

  const isCellHovering = cellsInteractive && hoveredCell !== null;
  const isLevelHovering = cellsInteractive && hoveredLegendLevel !== null;

  return (
    <HeatmapRect<HeatmapColumn, HeatmapBin>
      binHeight={binHeight}
      bins={(column) => column.bins}
      binWidth={binWidth}
      colorScale={(count) =>
        colorScale(typeof count === "number" ? count : count?.valueOf())
      }
      count={(bin) => bin.count}
      data={data}
      gap={gap}
      xScale={xScale}
      yScale={yScale}
    >
      {(cells) => (
        <Group className="visx-heatmap-rects">
          {cells.flatMap((column) =>
            column.map((cell) => {
              const bin = data[cell.column]?.bins[cell.row];
              if (!bin) {
                return null;
              }

              const isFaded = computeHeatmapCellFaded(
                isCellHovering,
                isLevelHovering,
                hoveredCell,
                hoveredLegendLevel,
                cell,
                bin.count
              );

              return (
                <HeatmapMotionCell
                  bin={bin}
                  cell={cell}
                  cornerRadius={cornerRadius}
                  fadedOpacity={fadedOpacity}
                  fillScale={fillScale}
                  interactive={cellsInteractive}
                  isFaded={isFaded}
                  key={`heatmap-cell-${cell.column}-${cell.row}`}
                  onEnter={handleCellEnter}
                  onLeave={handleCellLeave}
                />
              );
            })
          )}
        </Group>
      )}
    </HeatmapRect>
  );
});

HeatmapCells.displayName = "HeatmapCells";

export default HeatmapCells;
