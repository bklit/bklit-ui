import {
  DashPathEffect,
  LinearGradient,
  Path,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import { useMemo } from "react";
import { useChart } from "./chart-context";

export interface GridProps {
  horizontal?: boolean;
  vertical?: boolean;
  numTicksRows?: number;
  numTicksColumns?: number;
  stroke?: string;
  strokeWidth?: number;
  /** Default: [4, 4] (matches web "4,4"). Pass `null` for solid lines. */
  strokeDasharray?: [number, number] | null;
  /** Fade horizontal lines out at the left and right edges. Default: true. */
  fadeHorizontal?: boolean;
  /** Emphasised rows, e.g. `[0]` for a profit/loss zero line. */
  highlightRowValues?: number[];
  /** Default: theme foreground. */
  highlightRowStroke?: string;
  /** Default: 0.35 (web P&L examples). */
  highlightRowStrokeOpacity?: number;
  highlightRowStrokeWidth?: number;
  /** Default: [4, 4]. `null` for solid. */
  highlightRowStrokeDasharray?: [number, number] | null;
}

export function Grid({
  horizontal = true,
  vertical = false,
  numTicksRows = 5,
  numTicksColumns = 10,
  stroke,
  strokeWidth = 1,
  strokeDasharray = [4, 4],
  fadeHorizontal = true,
  highlightRowValues,
  highlightRowStroke,
  highlightRowStrokeOpacity = 0.35,
  highlightRowStrokeWidth = 1,
  highlightRowStrokeDasharray = [4, 4],
}: GridProps) {
  const { width, height, margin, xScale, yScale, theme } = useChart();
  const color = stroke ?? theme.grid;
  const left = margin.left;
  const right = width - margin.right;

  // One path for every row → one draw call.
  const rows = useMemo(() => {
    const p = Skia.PathBuilder.Make();
    if (horizontal) {
      for (const tick of yScale.ticks(numTicksRows)) {
        const y = Math.round(yScale(tick)) + 0.5;
        p.moveTo(left, y);
        p.lineTo(right, y);
      }
    }
    return p.build();
  }, [horizontal, yScale, numTicksRows, left, right]);

  const columns = useMemo(() => {
    const p = Skia.PathBuilder.Make();
    if (vertical) {
      for (const tick of xScale.ticks(numTicksColumns)) {
        const x = Math.round(xScale(tick)) + 0.5;
        p.moveTo(x, margin.top);
        p.lineTo(x, height - margin.bottom);
      }
    }
    return p.build();
  }, [vertical, xScale, numTicksColumns, margin, height]);

  const highlightRows = useMemo(() => {
    const p = Skia.PathBuilder.Make();
    for (const value of highlightRowValues ?? []) {
      const y = Math.round(yScale(value)) + 0.5;
      p.moveTo(left, y);
      p.lineTo(right, y);
    }
    return p.build();
  }, [highlightRowValues, yScale, left, right]);
  const highlightColor = highlightRowStroke ?? theme.foreground;

  const dash = strokeDasharray ? (
    <DashPathEffect intervals={strokeDasharray} />
  ) : null;

  return (
    <>
      <Path color={color} path={rows} strokeWidth={strokeWidth} style="stroke">
        {dash}
        {fadeHorizontal ? (
          <LinearGradient
            colors={["transparent", color, color, "transparent"]}
            end={vec(right, 0)}
            positions={[0, 0.1, 0.9, 1]}
            start={vec(left, 0)}
          />
        ) : null}
      </Path>
      {vertical ? (
        <Path
          color={color}
          path={columns}
          strokeWidth={strokeWidth}
          style="stroke"
        >
          {dash}
        </Path>
      ) : null}
      {highlightRowValues?.length ? (
        <Path
          color={highlightColor}
          opacity={highlightRowStrokeOpacity}
          path={highlightRows}
          strokeWidth={highlightRowStrokeWidth}
          style="stroke"
        >
          {highlightRowStrokeDasharray ? (
            <DashPathEffect intervals={highlightRowStrokeDasharray} />
          ) : null}
          {fadeHorizontal ? (
            <LinearGradient
              colors={[
                "transparent",
                highlightColor,
                highlightColor,
                "transparent",
              ]}
              end={vec(right, 0)}
              positions={[0, 0.1, 0.9, 1]}
              start={vec(left, 0)}
            />
          ) : null}
        </Path>
      ) : null}
    </>
  );
}
