"use client";

import { PatternLines } from "@bklitui/ui/charts";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const easeOutQuint = [0.23, 1, 0.32, 1] as const;

type DiagonalPreset = "diagonal" | "diagonalRightToLeft";

interface GridCell {
  col: number;
  row: number;
}

function cellId({ col, row }: GridCell) {
  return `${col}-${row}`;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function cellFromPoint(
  event: React.MouseEvent<HTMLDivElement>,
  columns: number,
  rows: number
): GridCell | null {
  const rect = event.currentTarget.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
    return null;
  }

  const col = Math.min(
    columns - 1,
    Math.max(0, Math.floor((x / rect.width) * columns))
  );
  const row = Math.min(
    rows - 1,
    Math.max(0, Math.floor((y / rect.height) * rows))
  );

  return { col, row };
}

function presetForCell(col: number, row: number): DiagonalPreset {
  return (col + row) % 2 === 0 ? "diagonal" : "diagonalRightToLeft";
}

function pickRandomCell(
  columns: number,
  rows: number,
  occupied: Set<string>
): GridCell | null {
  const available: GridCell[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const cell = { col, row };
      if (!occupied.has(cellId(cell))) {
        available.push(cell);
      }
    }
  }

  if (available.length === 0) {
    return null;
  }

  return available[Math.floor(Math.random() * available.length)] ?? null;
}

function GridCellPulsePattern({ preset }: { preset: DiagonalPreset }) {
  const uniqueId = useId();
  const patternId = `grid-cell-pulse-${uniqueId.replace(/:/g, "")}`;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
    >
      <title>Grid cell pattern</title>
      <defs>
        <PatternLines
          height={8}
          id={patternId}
          orientation={
            preset === "diagonalRightToLeft"
              ? ["diagonalRightToLeft"]
              : ["diagonal"]
          }
          stroke="var(--border)"
          strokeWidth={1}
          width={8}
        />
      </defs>
      <rect fill={`url(#${patternId})`} height="100%" width="100%" />
    </svg>
  );
}

const NORMAL_SPAWN_INTERVAL_MS: [number, number] = [1400, 3200];
const MIN_SPAWN_INTERVAL_MS: [number, number] = [400, 900];

export function GridCellPulse({
  columns,
  rows,
  className,
  minRandomActive = 1,
  maxRandomActive = 3,
}: {
  columns: number;
  rows: number;
  className?: string;
  /** Minimum number of randomly pulsing cells to keep active. */
  minRandomActive?: number;
  /** Maximum number of randomly pulsing cells at once. */
  maxRandomActive?: number;
}) {
  const reducedMotion = useReducedMotion();
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null);
  const [randomCells, setRandomCells] = useState<GridCell[]>([]);
  const spawnTimerRef = useRef<number | undefined>(undefined);
  const randomCellsRef = useRef<GridCell[]>([]);

  const effectiveMin = Math.min(minRandomActive, maxRandomActive);

  const scheduleCellRemoval = useCallback((cell: GridCell) => {
    const holdMs = randomBetween(2400, 5200);
    window.setTimeout(() => {
      setRandomCells((active) =>
        active.filter((current) => cellId(current) !== cellId(cell))
      );
    }, holdMs);
  }, []);

  const spawnRandomCell = useCallback(() => {
    setRandomCells((current) => {
      if (current.length >= maxRandomActive) {
        return current;
      }

      const occupied = new Set(current.map((cell) => cellId(cell)));
      const nextCell = pickRandomCell(columns, rows, occupied);
      if (!nextCell) {
        return current;
      }

      scheduleCellRemoval(nextCell);
      return [...current, nextCell];
    });
  }, [columns, maxRandomActive, rows, scheduleCellRemoval]);

  const fillToMinimum = useCallback(() => {
    setRandomCells((current) => {
      if (current.length >= effectiveMin || current.length >= maxRandomActive) {
        return current;
      }

      const next = [...current];
      const occupied = new Set(next.map((cell) => cellId(cell)));

      while (next.length < effectiveMin && next.length < maxRandomActive) {
        const cell = pickRandomCell(columns, rows, occupied);
        if (!cell) {
          break;
        }
        occupied.add(cellId(cell));
        scheduleCellRemoval(cell);
        next.push(cell);
      }

      return next;
    });
  }, [columns, effectiveMin, maxRandomActive, rows, scheduleCellRemoval]);

  useEffect(() => {
    randomCellsRef.current = randomCells;
  }, [randomCells]);

  useEffect(() => {
    if (reducedMotion || randomCells.length >= effectiveMin) {
      return;
    }

    fillToMinimum();
  }, [effectiveMin, fillToMinimum, randomCells.length, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || columns < 1 || rows < 1) {
      return;
    }

    const scheduleNextSpawn = () => {
      const belowMinimum = randomCellsRef.current.length < effectiveMin;
      const [minDelay, maxDelay] = belowMinimum
        ? MIN_SPAWN_INTERVAL_MS
        : NORMAL_SPAWN_INTERVAL_MS;

      spawnTimerRef.current = window.setTimeout(
        () => {
          if (randomCellsRef.current.length < effectiveMin) {
            fillToMinimum();
          } else {
            spawnRandomCell();
          }
          scheduleNextSpawn();
        },
        randomBetween(minDelay, maxDelay)
      );
    };

    fillToMinimum();
    scheduleNextSpawn();

    return () => {
      if (spawnTimerRef.current !== undefined) {
        window.clearTimeout(spawnTimerRef.current);
      }
    };
  }, [
    columns,
    effectiveMin,
    fillToMinimum,
    reducedMotion,
    rows,
    spawnRandomCell,
  ]);

  if (columns < 1 || rows < 1) {
    return null;
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const cell = cellFromPoint(event, columns, rows);
    setHoveredCell((current) => {
      if (current?.col === cell?.col && current?.row === cell?.row) {
        return current;
      }
      return cell;
    });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const fadeInTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.15, ease: easeOutQuint };
  const fadeOutTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 1, ease: easeOutQuint };

  const randomCellIds = new Set(randomCells.map((cell) => cellId(cell)));

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 z-1 grid overflow-hidden", className)}
      data-grid-pulse
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: columns * rows }, (_, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const id = cellId({ col, row });
        const isHovered = hoveredCell?.col === col && hoveredCell?.row === row;
        const isRandom = randomCellIds.has(id);
        const isActive = isHovered || isRandom;
        const preset = presetForCell(col, row);

        return (
          <div className="relative min-h-0 min-w-0" key={id}>
            <AnimatePresence mode="wait">
              {isActive ? (
                <motion.div
                  animate={{
                    opacity: 1,
                    transition: fadeInTransition,
                  }}
                  className="pointer-events-none absolute inset-0"
                  exit={{
                    opacity: 0,
                    transition: fadeOutTransition,
                  }}
                  initial={{ opacity: 0 }}
                  key={id}
                >
                  <GridCellPulsePattern preset={preset} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
