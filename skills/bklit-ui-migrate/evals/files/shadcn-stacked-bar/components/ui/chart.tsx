// biome-ignore-all lint/performance/noNamespaceImport: fixture mirrors the shadcn chart.tsx wrapper
"use client";

// Trimmed copy of the shadcn/ui chart wrapper (components/ui/chart.tsx).
import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn("flex aspect-video justify-center text-xs", className)}
        data-chart={chartId}
        data-slot="chart"
        {...props}
      >
        <ChartStyle config={config} id={chartId} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, c]) => c.theme || c.color
  );
  if (!colorConfig.length) {
    return null;
  }
  const css = Object.entries(THEMES)
    .map(
      ([theme, prefix]) =>
        `${prefix} [data-chart=${id}] {\n${colorConfig
          .map(([key, item]) => {
            const color =
              item.theme?.[theme as keyof typeof item.theme] || item.color;
            return color ? `  --color-${key}: ${color};` : null;
          })
          .join("\n")}\n}`
    )
    .join("\n");
  return <style>{css}</style>;
};

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = "dot",
  hideLabel = false,
  labelFormatter,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  hideLabel?: boolean;
  indicator?: "line" | "dot" | "dashed";
  labelFormatter?: (label: unknown) => React.ReactNode;
  // biome-ignore lint/suspicious/noExplicitAny: fixture mirrors shadcn
  payload?: any[];
  label?: unknown;
  active?: boolean;
}) {
  const { config } = useChart();
  if (!(active && payload?.length)) {
    return null;
  }
  return (
    <div className="grid min-w-32 gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl">
      {hideLabel ? null : (
        <div className="font-medium">
          {labelFormatter ? labelFormatter(label) : String(label)}
        </div>
      )}
      {payload.map((item) => (
        <div className="flex items-center gap-2" key={item.dataKey}>
          <div
            className={cn(
              "shrink-0 rounded-[2px]",
              indicator === "dot" ? "h-2.5 w-2.5" : "w-1"
            )}
            style={{ background: item.color }}
          />
          <span className="text-muted-foreground">
            {config[item.dataKey]?.label ?? item.name}
          </span>
          <span className="ml-auto font-medium font-mono tabular-nums">
            {item.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  payload,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: fixture mirrors shadcn
  payload?: any[];
}) {
  const { config } = useChart();
  if (!payload?.length) {
    return null;
  }
  return (
    <div className="flex items-center justify-center gap-4 pt-3">
      {payload.map((item) => (
        <div className="flex items-center gap-1.5" key={item.value}>
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: item.color }}
          />
          {config[item.dataKey]?.label}
        </div>
      ))}
    </div>
  );
}

export {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
};
