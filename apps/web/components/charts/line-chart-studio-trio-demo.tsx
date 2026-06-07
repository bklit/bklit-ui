"use client";

import {
  Background,
  ChartBrush,
  ChartBrushLayout,
  ChartLegend,
  ChartLegendHoverProvider,
  ChartTooltip,
  Line,
  LineChart,
  XAxis,
} from "@bklitui/ui/charts";
import { curveCatmullRom } from "@visx/curve";
import { useMemo, useState } from "react";

/** Studio share URL for this trio preset (line-chart, 3 series, dot background). */
export const LINE_CHART_STUDIO_TRIO_SHARE_PATH =
  "/studio?s=v1.NrAMBoCIBsEsDsCmBaAxgCwIYCcAukBdcYAJigHsBraDAClADoAOJkgAkYEYBmTt3kgwCcoAOwBKQsW4VqdRixIBSEqC68VoAcLHiAPlRrpanTaE0lOAVgaWr%2Bw-OZWzDMUM0AWJsKGSiwFbgnGKcAQBs4OHeASRCUKiYuAC2AK7Q0ABK5MlSwJycZJAkeiUkeQUykABG5LjoerX1jXXoFZyRkKB63aDtolDcelbD7UxQ3WXt8V0MI1MBhRBdPT0VJFWJKelZOXpbaRnZyftJh7u5iySe4NxXQaJWi54zACZ1AM4VVpzBtk-EawyRiPRZWIKQRzGRjhcEcNhMITMUThNgAeg4DE8Em%2BA0hcmhDG4TG4mIK7BIok8DA6VnRmNATH8gPCZGsi3CMm44UWonGuGwqUQiyYQQFQpFnXeuC%2BIrxUPozHCqMY3DVbDiglAJHCzPyLHAjAB%2BREhv%2BiyEVQVjBedMYGzpiORqIxoD1nCENyNFrFguFgKEnVw5AADhUhONIOhyNhYAAvcjwXCYaB5VRkABmKY%2B-tIWjNJFioAhcCQDAAnpgAB6wD4MaCIDO4PSlxAV6u1hixgDm6GbrYY3djr0IBCAA";

const TRIO_STROKES = {
  desktop: "oklch(0.882 0.131 312.907)",
  mobile: "oklch(1 0 215.215)",
  tablet: "oklch(0.85 0.079 48.99)",
} as const;

const TRIO_KEYS = ["desktop", "mobile", "tablet"] as const;

const trioData = Array.from({ length: 30 }, (_, index) => {
  const date = new Date(2025, 0, 1 + index);
  return {
    date,
    desktop: Math.round(180 + Math.sin(index / 4.2) * 70 + ((index * 9) % 31)),
    mobile: Math.round(120 + Math.cos(index / 3.8) * 55 + ((index * 5) % 23)),
    tablet: Math.round(
      150 + Math.sin(index / 5.1 + 1) * 48 + ((index * 7) % 19)
    ),
  };
});

const brushStripMargin = { top: 4, right: 8, bottom: 4, left: 8 };
const chartMargin = { top: 8, right: 8, bottom: 40, left: 8 };

export function LineChartStudioTrioDemo() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const legendItems = useMemo(() => {
    const last = trioData.at(-1);
    if (!last) {
      return [];
    }
    return TRIO_KEYS.map((key) => ({
      label: key,
      value: last[key],
      color: TRIO_STROKES[key],
    }));
  }, []);

  return (
    <ChartLegendHoverProvider
      hoveredIndex={hoveredIndex}
      onHoverChange={setHoveredIndex}
    >
      <div className="flex w-full flex-col gap-2" style={{ height: 360 }}>
        <div className="flex justify-end px-2">
          <ChartLegend
            className="w-full flex-row flex-wrap gap-x-4 gap-y-2"
            hoveredIndex={hoveredIndex}
            itemClassName="w-auto shrink-0"
            items={legendItems}
            labelClassName="font-medium text-xs tabular-nums"
            onHover={setHoveredIndex}
            showValue={false}
          />
        </div>
        <ChartBrushLayout
          brushStrip={(brushLayout) => (
            <LineChart
              animationDuration={0}
              className="size-full"
              data={trioData}
              margin={brushStripMargin}
              status="ready"
              style={{ aspectRatio: "unset", height: "100%" }}
            >
              {TRIO_KEYS.map((key) => (
                <Line
                  animate={false}
                  curve={curveCatmullRom}
                  dataKey={key}
                  fadeEdges
                  key={`brush-${key}`}
                  showHighlight={false}
                  stroke={TRIO_STROKES[key]}
                  strokeWidth={2}
                />
              ))}
              <ChartBrush
                initialSelection={brushLayout.brushSelection ?? undefined}
                onSelectionChange={brushLayout.onBrushSelectionChange}
              />
            </LineChart>
          )}
          data={trioData}
          enabled
          height={72}
        >
          {(brushLayout) => (
            <LineChart
              className="size-full"
              data={trioData}
              margin={chartMargin}
              style={{ aspectRatio: "unset", height: "100%" }}
              tweenYDomainOnXDomainChange
              xDomain={brushLayout.xDomain}
              xDomainSlotCount={brushLayout.xDomainSlotCount}
              yDomainTween
            >
              <Background opacity={0.85} pattern="dots" />
              {TRIO_KEYS.map((key) => (
                <Line
                  curve={curveCatmullRom}
                  dataKey={key}
                  fadeEdges
                  key={key}
                  showHighlight
                  stroke={TRIO_STROKES[key]}
                  strokeWidth={2}
                />
              ))}
              <XAxis />
              <ChartTooltip />
            </LineChart>
          )}
        </ChartBrushLayout>
      </div>
    </ChartLegendHoverProvider>
  );
}
