"use client";

import {
  animate,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { DEFAULT_CHART_ENTER_TRANSITION } from "../animation";
import { useIsomorphicLayoutEffect } from "../chart-parent-size";
import type { ChartStatus } from "../chart-phase";
import {
  HEATMAP_LOADING_BASE_CELL_OPACITY,
  HEATMAP_LOADING_CONCEAL_MS,
  heatmapLoadingCellParticipates,
  heatmapWaveDelayMs,
  resolveHeatmapWaveTiming,
} from "./heatmap-animation";
import { heatmapLevelCellFillOpacity } from "./heatmap-colors";
import {
  type HeatmapBin,
  type HeatmapColumn,
  useHeatmap,
  useHeatmapInteraction,
} from "./heatmap-context";
import { heatmapRectCells } from "./heatmap-rect-cells";
import {
  getHeatmapContributionLevel,
  isHeatmapGhostBin,
  isHeatmapHoverEffectEnabled,
  resolveHeatmapDisplayRange,
  resolveHeatmapHoverStyle,
  resolveHeatmapRowOpacity,
} from "./heatmap-utils";

const HEATMAP_INACTIVE_OPACITY = 0.3;
/** Where each cell starts its enter: slightly small and 3px low (no pop). */
const HEATMAP_ENTER_FROM_TRANSFORM = "translateY(3px) scale(0.86)";
/** Smooth tween for inactive opacity + scale on hover. */
const HEATMAP_INACTIVE_TRANSITION = {
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1] as const,
};
const HEATMAP_CONCEAL_TRANSITION = {
  duration: HEATMAP_LOADING_CONCEAL_MS / 1000,
  ease: DEFAULT_CHART_ENTER_TRANSITION.ease,
};

/**
 * Applies a motion value to the DOM on every change (and on each render, so
 * the first paint already shows the current value) without re-rendering.
 */
function useMotionValueApply(
  value: MotionValue<number>,
  apply: (v: number) => void
) {
  const applyRef = useRef(apply);
  applyRef.current = apply;
  useIsomorphicLayoutEffect(() => {
    applyRef.current(value.get());
  });
  useMotionValueEvent(value, "change", (v) => applyRef.current(v));
}

function computeHeatmapCellFaded(
  isCellHovering: boolean,
  isLevelHovering: boolean,
  hoveredCell: { column: number; row: number } | null,
  hoveredLegendLevel: number | null,
  cell: { column: number; row: number },
  count: number
): { isHighlighted: boolean; isDimmed: boolean } {
  if (isCellHovering && hoveredCell) {
    const isHighlighted =
      hoveredCell.column === cell.column && hoveredCell.row === cell.row;
    return { isHighlighted, isDimmed: !isHighlighted };
  }
  if (isLevelHovering && hoveredLegendLevel !== null) {
    const isHighlighted =
      getHeatmapContributionLevel(count) === hoveredLegendLevel;
    return { isHighlighted, isDimmed: !isHighlighted };
  }
  return { isHighlighted: false, isDimmed: false };
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
    // The column wave itself is a WAAPI fade on the rect (see
    // HeatmapMotionCell); the motion value just holds the resting target.
    pulseOpacity.set(0);
    shimmerOpacity.set(0);
    dataOpacity.jump(readyDataOpacity);
    return;
  }

  if (isAwaitingLoadingConceal || isExitingToLoading) {
    animate(dataOpacity, 0, HEATMAP_CONCEAL_TRANSITION);
    animate(shimmerOpacity, 0, { duration: 0 });
    return;
  }

  if (isReadyResting) {
    animate(dataOpacity, readyDataOpacity, HEATMAP_INACTIVE_TRANSITION);
    animate(shimmerOpacity, 0, { duration: 0 });
    pulseOpacity.set(0);
  }
}

export interface HeatmapCellsProps {
  /** Corner radius for each cell. Default: 2 */
  cornerRadius?: number;
  /** Override the default GitHub-style green color scale. */
  colorScale?: (count: number | null | undefined) => string;
  /** Opacity for inactive cells while hovering. Default: 0.3 */
  inactiveOpacity?: number;
  /** Scale for inactive cells while hovering. Default: 1 */
  inactiveScale?: number;
  /** Scale for the highlighted cell while hovering. Default: 1 */
  activeScale?: number;
  /** Per-row opacity multiplier (display row index). Default: 1 */
  rowOpacity?: number | readonly number[];
  /** Pointer hover + dimming. Default: true */
  interactive?: boolean;
  /** Hide out-of-range bins (GitHub-style ghost cells). Default: true */
  hideGhostCells?: boolean;
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
  inactiveOpacity: number;
  inactiveScale: number;
  activeScale: number;
  rowOpacity: number | readonly number[] | undefined;
  hoverState: { isHighlighted: boolean; isDimmed: boolean };
  onEnter: (
    column: number,
    row: number,
    bin: HeatmapBin,
    x: number,
    y: number
  ) => void;
  onLeave: () => void;
  /** Column-wave enter delay (ms). */
  enterDelayMs: number;
  /** Per-cell enter fade (ms). */
  enterFadeMs: number;
  /** CSS easing for the enter fade. */
  enterFadeEasing: string;
}

const HeatmapMotionCell = memo(function HeatmapMotionCell({
  cell,
  bin,
  cornerRadius,
  fillScale,
  interactive,
  inactiveOpacity,
  inactiveScale,
  activeScale,
  rowOpacity,
  hoverState,
  onEnter,
  onLeave,
  enterDelayMs,
  enterFadeMs,
  enterFadeEasing,
}: HeatmapCellRectProps & {
  fillScale: (count: number | null | undefined) => string;
}) {
  const {
    chartStatus,
    chartPhase,
    isLoaded,
    revealMode,
    revealEpoch,
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

  const dataRectRef = useRef<SVGRectElement>(null);
  const shimmerRectRef = useRef<SVGRectElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const scale = useMotionValue(1);
  const revealAnimationRef = useRef<Animation | null>(null);

  const readyHoverStyle = resolveHeatmapHoverStyle(
    hoverState.isHighlighted,
    hoverState.isDimmed,
    { inactiveOpacity, inactiveScale, activeScale }
  );
  const rowOpacityMultiplier = resolveHeatmapRowOpacity(cell.row, rowOpacity);
  const readyDataOpacity = readyHoverStyle.opacity;
  const readyScale = isReadyResting ? readyHoverStyle.scale : 1;
  const transformOrigin = `${cell.x + cell.width / 2}px ${cell.y + cell.height / 2}px`;

  useEffect(() => {
    if (scale.get() === readyScale && !scale.isAnimating()) {
      return;
    }
    const controls = animate(scale, readyScale, HEATMAP_INACTIVE_TRANSITION);
    return () => controls.stop();
  }, [readyScale, scale]);

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
  ]);

  // Column wave: one WAAPI animation per cell (opacity + a small settle from
  // scale 0.86 / 3px below), delayed by its eased column position. Started in
  // a layout effect so `fill: "backwards"` hides the cell before the first
  // paint (no flash on replay). The implicit end keyframe resolves to the
  // live inline opacity / transform, so hover changes mid-entrance carry
  // through, and the finished animation is cancelled to hand off cleanly.
  useIsomorphicLayoutEffect(() => {
    if (!(animateCells && isRevealActive)) {
      if (!animateCells || chartStatus === "loading") {
        revealAnimationRef.current?.cancel();
        revealAnimationRef.current = null;
      }
      return;
    }
    const rect = dataRectRef.current;
    if (!rect || typeof rect.animate !== "function") {
      return;
    }
    revealAnimationRef.current?.cancel();
    const animation = rect.animate(
      [
        {
          offset: 0,
          opacity: 0,
          transform: HEATMAP_ENTER_FROM_TRANSFORM,
        },
      ],
      {
        delay: enterDelayMs,
        duration: enterFadeMs,
        easing: enterFadeEasing,
        fill: "backwards",
      }
    );
    animation.onfinish = () => {
      animation.cancel();
      if (revealAnimationRef.current === animation) {
        revealAnimationRef.current = null;
      }
    };
    revealAnimationRef.current = animation;
  }, [
    animateCells,
    chartStatus,
    enterDelayMs,
    enterFadeEasing,
    enterFadeMs,
    isRevealActive,
    revealEpoch,
  ]);

  const cellProps = {
    height: cell.height,
    rx: cornerRadius,
    ry: cornerRadius,
    width: cell.width,
    x: cell.x,
    y: cell.y,
  };

  // Plain SVG elements driven by motion values through direct style writes:
  // no motion component (or React render) per cell per frame.
  useMotionValueApply(scale, (v) => {
    const g = groupRef.current;
    if (g) {
      g.style.transform = v === 1 ? "" : `scale(${v})`;
    }
  });
  useMotionValueApply(dataOpacity, (v) => {
    if (dataRectRef.current) {
      dataRectRef.current.style.opacity = String(v);
    }
  });
  const shimmerSource = showShimmerPulse ? pulseOpacity : shimmerOpacity;
  useMotionValueApply(shimmerSource, (v) => {
    if (shimmerRectRef.current) {
      shimmerRectRef.current.style.opacity = String(v);
    }
  });

  return (
    <g ref={groupRef} style={{ transformOrigin }}>
      <rect
        {...cellProps}
        fill={targetFill}
        fillOpacity={
          (cell.opacity ?? 1) * patternFillOpacity * rowOpacityMultiplier
        }
        onPointerEnter={() =>
          onEnter(cell.column, cell.row, bin, cell.x, cell.y)
        }
        onPointerLeave={onLeave}
        ref={dataRectRef}
        style={{
          cursor: interactive ? "pointer" : undefined,
          // Centre in user space (not `transform-box: fill-box`, which makes
          // Chrome re-measure the bbox every frame of the enter animation).
          transformOrigin,
        }}
      />
      <rect
        {...cellProps}
        fill={emptyFill}
        pointerEvents="none"
        ref={shimmerRectRef}
      />
    </g>
  );
});

export const HeatmapCells = memo(function HeatmapCells({
  cornerRadius = 2,
  colorScale: colorScaleProp,
  inactiveOpacity = HEATMAP_INACTIVE_OPACITY,
  inactiveScale = 1,
  activeScale = 1,
  rowOpacity,
  interactive = true,
  hideGhostCells = true,
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
    animationDuration,
    enterTransition,
    enterStaggerScale,
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

  const inactiveEnabled = isHeatmapHoverEffectEnabled({
    inactiveOpacity,
    inactiveScale,
    activeScale,
  });
  const isCellHovering =
    cellsInteractive && hoveredCell !== null && inactiveEnabled;
  const isLevelHovering =
    cellsInteractive && hoveredLegendLevel !== null && inactiveEnabled;

  const displayRange = useMemo(
    () => (hideGhostCells ? resolveHeatmapDisplayRange(data) : null),
    [data, hideGhostCells]
  );

  // Same cells visx HeatmapRect built (see heatmap-rect-cells.ts); they only
  // change with layout and data, so hover re-renders reuse them.
  const cells = useMemo(
    () =>
      heatmapRectCells<HeatmapColumn, HeatmapBin>({
        binHeight,
        bins: (column) => column.bins,
        binWidth,
        colorScale,
        count: (bin) => bin.count,
        data,
        gap,
        xScale,
        yScale,
      }),
    [binHeight, binWidth, colorScale, data, gap, xScale, yScale]
  );

  const waveTiming = useMemo(
    () =>
      resolveHeatmapWaveTiming({
        animationDurationMs: animationDuration,
        enterTransition,
        enterStaggerScale,
        columnCount: data.length,
        rowCount: data[0]?.bins.length ?? 7,
      }),
    [animationDuration, data, enterStaggerScale, enterTransition]
  );

  return (
    // The wrapper visx's <Group> rendered (minus its class): cells stay one
    // <g> deep, each in its own motion <g>.
    <g transform="translate(0, 0)">
      {cells.flatMap((column) =>
        column.map((cell) => {
          const bin = data[cell.column]?.bins[cell.row];
          if (!bin) {
            return null;
          }

          if (displayRange && isHeatmapGhostBin(bin, displayRange)) {
            return null;
          }

          const hoverState = computeHeatmapCellFaded(
            isCellHovering,
            isLevelHovering,
            hoveredCell,
            hoveredLegendLevel,
            cell,
            bin.count
          );

          return (
            <HeatmapMotionCell
              activeScale={activeScale}
              bin={bin}
              cell={cell}
              cornerRadius={cornerRadius}
              enterDelayMs={heatmapWaveDelayMs(
                cell.column,
                cell.row,
                waveTiming
              )}
              enterFadeEasing={waveTiming.fadeEasing}
              enterFadeMs={waveTiming.fadeMs}
              fillScale={fillScale}
              hoverState={hoverState}
              inactiveOpacity={inactiveOpacity}
              inactiveScale={inactiveScale}
              interactive={cellsInteractive}
              key={`heatmap-cell-${cell.column}-${cell.row}`}
              onEnter={handleCellEnter}
              onLeave={handleCellLeave}
              rowOpacity={rowOpacity}
            />
          );
        })
      )}
    </g>
  );
});

HeatmapCells.displayName = "HeatmapCells";

export default HeatmapCells;
