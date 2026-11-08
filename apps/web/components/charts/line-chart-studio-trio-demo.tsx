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
import { curveCatmullRom } from "d3-shape";
import { useMemo, useState } from "react";

/** Studio share URL for this trio preset (line-chart, 3 series, dot background). */
export const LINE_CHART_STUDIO_TRIO_SHARE_PATH =
  "/studio?s=v1.NrAMBoCIBsEsDsCmBaAxgCwIYCcAukBdcYAJigHsBraDAClADoAOJkgAkYEYBmTt3kgwCcoAOwBKQsW4VqdRixIBSEqC68VoAcLHiAPlRrpanTaE0lOAVgaWr%2Bw-OZWzDMUM0AWJsKGSiwFbgnGKcAQBs4OHeASRCUKiYuAC2AK7Q0ABK5MlSwDxMUCR6xSR5PPGQAEbkuOh6NXUNtejlnmSQoHpdoG0ykNx6VkNtnlBdpW1BnQzDkwGcnpGd3d1tlYkp6Vk5eptpGdnJe0kHO7kLVhDcl5zgolYLD1AAJrUAzuWiosG2j8ScUTxRgPBZMO6QRzGRjhKxWDhsJhCZiicJsAD0HAYngk5SY-Sh9AY3HxWM4nHYJFEngYnFhGKxoCY-gBLGC-3ySPA3HCsRC4Fw2FSiD5P0Fwr5hUgb1wnz5lUJCnCaMY3DVbDiglAJHCLNIqnAjA5JBNhr%2BsRI00V2KE8MYJG48KRKLRmNAepNkSNFrFQpFxBNUtw5AADnkHRBIOhyNhYAAvcjwXCYaDh7hjABmKfe-tIjrNJFi3B%2BMAQiAYAE9MAAPWDvBjQRAZ3B6OBISs1usMWMAc3QLbb5Z7sZehAIQA";

/** Palette tokens so the trio follows the selected chart theme. */
const TRIO_STROKES = {
  desktop: "var(--chart-1)",
  mobile: "var(--chart-2)",
  tablet: "var(--chart-3)",
} as const;

const TRIO_KEYS = ["desktop", "mobile", "tablet"] as const;

/** The trio series (also the present dialog's editable rows). */
export const LINE_CHART_STUDIO_TRIO_DATA = Array.from(
  { length: 30 },
  (_, index) => {
    const date = new Date(2025, 0, 1 + index);
    return {
      date,
      desktop: Math.round(
        180 + Math.sin(index / 4.2) * 70 + ((index * 9) % 31)
      ),
      mobile: Math.round(120 + Math.cos(index / 3.8) * 55 + ((index * 5) % 23)),
      tablet: Math.round(
        150 + Math.sin(index / 5.1 + 1) * 48 + ((index * 7) % 19)
      ),
    };
  }
);

const brushStripMargin = { top: 4, right: 8, bottom: 4, left: 8 };
const chartMargin = { top: 8, right: 8, bottom: 40, left: 8 };

export type LineChartStudioTrioRow =
  (typeof LINE_CHART_STUDIO_TRIO_DATA)[number];

export function LineChartStudioTrioDemo({
  height = 360,
  data = LINE_CHART_STUDIO_TRIO_DATA,
  plotAspect,
}: {
  height?: number;
  /** Override the series (present dialog data editor). */
  data?: LineChartStudioTrioRow[];
  /**
   * Size the main plot by aspect (e.g. `"2 / 1"`) instead of a fixed total
   * `height`; the legend and brush keep their own height around it. The plot
   * wrapper carries `data-chart-plot` for the present dialog.
   */
  plotAspect?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const legendItems = useMemo(() => {
    const last = data.at(-1);
    if (!last) {
      return [];
    }
    return TRIO_KEYS.map((key) => ({
      label: key,
      value: last[key],
      color: TRIO_STROKES[key],
    }));
  }, [data]);

  return (
    <ChartLegendHoverProvider
      hoveredIndex={hoveredIndex}
      onHoverChange={setHoveredIndex}
    >
      <div
        className="flex w-full flex-col gap-2"
        style={plotAspect ? undefined : { height }}
      >
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
              data={data}
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
          data={data}
          enabled
          fitMainContent={Boolean(plotAspect)}
          height={72}
        >
          {(brushLayout) => {
            const plot = (
              <LineChart
                className="size-full"
                data={data}
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
            );
            return plotAspect ? (
              <div
                className="relative w-full"
                data-chart-plot=""
                style={{ aspectRatio: plotAspect }}
              >
                {plot}
              </div>
            ) : (
              plot
            );
          }}
        </ChartBrushLayout>
      </div>
    </ChartLegendHoverProvider>
  );
}
