"use client";

import { useId, useLayoutEffect, useMemo, useRef } from "react";
import type { AreaProps } from "./area";
import {
  layoutAreaValueLabels,
  resolveAreaValueLabelCount,
} from "./area-value-label-layout";
import { chartCssVars, useChartStable } from "./chart-context";
import {
  fadeGradientStops,
  resolveFadeSides,
  viewportFadeGradientAttrs,
} from "./fade-edges";
import { selectEvenlySpacedIndices } from "./x-axis";

/** One final layer keeps later area fills from painting over earlier labels. */
export function AreaValueLabels({ series }: { series: AreaProps[] }) {
  const {
    data,
    xScale,
    xAccessor,
    yScale,
    yScales,
    innerWidth,
    innerHeight,
    chartPhase,
  } = useChartStable();
  const layerRef = useRef<SVGGElement>(null);
  const id = useId();
  const labels = useMemo(() => {
    if (!["revealing", "ready", "exitingReady"].includes(chartPhase)) {
      return [];
    }
    const visible = data
      .map((datum, index) => ({ datum, index, x: xScale(xAccessor(datum)) }))
      .filter(({ x }) => Number.isFinite(x) && x >= 0 && x <= innerWidth);
    return series.flatMap((area, seriesIndex) => {
      if (!area.showValue) {
        return [];
      }
      const points = visible.filter(
        ({ datum }) =>
          typeof datum[area.dataKey] === "number" &&
          Number.isFinite(datum[area.dataKey])
      );
      const count = resolveAreaValueLabelCount(
        points.length,
        innerWidth,
        area.valueLabelMinCount,
        area.valueLabelMaxCount
      );
      if (count === 0) {
        return [];
      }
      const sampled =
        count === 1 ? [0] : selectEvenlySpacedIndices(points.length, count);
      // Axis sampling may return one extra tick; keep the explicit maximum strict.
      const indices =
        sampled.length > count
          ? Array.from(
              { length: count },
              (_, i) =>
                sampled[Math.round((i * (sampled.length - 1)) / (count - 1))]
            )
          : sampled;
      return indices.flatMap((position) => {
        const point = position == null ? undefined : points[position];
        if (!point) {
          return [];
        }
        const { datum, index, x } = point;
        const value = datum[area.dataKey] as number;
        const scale = yScales[String(area.yAxisId ?? "left")] ?? yScale;
        const y = scale(value);
        if (!Number.isFinite(y)) {
          return [];
        }
        return [
          {
            index,
            seriesIndex,
            x,
            y,
            text:
              area.valueLabelFormatter?.(value) ??
              value.toLocaleString("fa-IR", { maximumFractionDigits: 0 }),
          },
        ];
      });
    });
  }, [
    data,
    series,
    xScale,
    xAccessor,
    yScale,
    yScales,
    innerWidth,
    chartPhase,
  ]);

  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!layer) {
      return;
    }
    let active = true;
    const arrange = () => {
      if (!active) {
        return;
      }
      const elements = Array.from(layer.querySelectorAll("text"));
      const boxes = labels.map((label, index) => {
        const bounds = elements[index]?.getBBox();
        return {
          ...label,
          width: bounds?.width ?? 0,
          height: bounds?.height ?? 0,
        };
      });
      for (const element of elements) {
        element.style.visibility = "hidden";
      }
      for (const box of layoutAreaValueLabels(boxes, innerWidth, innerHeight)) {
        const element = elements[box.source];
        if (!element) {
          continue;
        }
        // Measure at the origin so font ascent, Persian digits and custom formats are respected.
        const bounds = element.getBBox();
        element.setAttribute(
          "transform",
          `translate(${box.x - bounds.x - bounds.width / 2}, ${box.y - bounds.y - bounds.height / 2})`
        );
        element.style.visibility = "visible";
      }
    };
    arrange();
    // Font loading changes Persian glyph widths; remeasure before deciding collisions.
    document.fonts.ready.then(arrange);
    document.fonts.addEventListener("loadingdone", arrange);
    return () => {
      active = false;
      document.fonts.removeEventListener("loadingdone", arrange);
    };
  }, [labels, innerWidth, innerHeight]);

  return (
    <g pointerEvents="none" ref={layerRef}>
      <defs>
        {series.map(
          (area, index) =>
            area.fadeValueLabels && (
              <g key={area.dataKey}>
                <linearGradient
                  id={`${id}-${index}`}
                  {...viewportFadeGradientAttrs(innerWidth)}
                >
                  {fadeGradientStops(
                    resolveFadeSides(area.fadeEdges ?? false)
                  ).map((stop) => (
                    <stop
                      key={stop.offset}
                      offset={stop.offset}
                      stopColor="white"
                      stopOpacity={stop.opacity}
                    />
                  ))}
                </linearGradient>
                <mask
                  height={innerHeight}
                  id={`${id}-${index}-mask`}
                  maskUnits="userSpaceOnUse"
                  width={innerWidth}
                  x={0}
                  y={0}
                >
                  <rect
                    fill={`url(#${id}-${index})`}
                    height={innerHeight}
                    width={innerWidth}
                  />
                </mask>
              </g>
            )
        )}
      </defs>
      {labels.map((label) => {
        const area = series[label.seriesIndex];
        if (!area) {
          return null;
        }
        return (
          <g
            key={`${label.seriesIndex}-${label.index}`}
            mask={
              area.fadeValueLabels
                ? `url(#${id}-${label.seriesIndex}-mask)`
                : undefined
            }
          >
            <text
              className="font-medium text-[10px]"
              fill={
                area.valueLabelColor ??
                area.stroke ??
                (area.fill?.startsWith("url(") ? undefined : area.fill) ??
                chartCssVars.linePrimary
              }
              style={{
                visibility: "hidden",
                paintOrder: "stroke",
                stroke: "var(--background)",
                strokeWidth: 3,
              }}
              x={0}
              y={0}
            >
              {label.text}
            </text>
          </g>
        );
      })}
    </g>
  );
}
