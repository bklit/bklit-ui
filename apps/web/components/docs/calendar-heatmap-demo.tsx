"use client";

import { CalendarHeatmap } from "@bklitui/ui/charts";
import { useTheme } from "next-themes";
import { calendarHeatmapSampleData } from "./calendar-heatmap-data";

const GITHUB_COLORS_LIGHT = [
  "#ebedf0",
  "#9be9a8",
  "#40c463",
  "#30a14e",
  "#216e39",
];

const GITHUB_COLORS_DARK = [
  "#161b22",
  "#0e4429",
  "#006d32",
  "#26a641",
  "#39d353",
];

export function CalendarHeatmapGithubDemo() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const colors = isDark ? GITHUB_COLORS_DARK : GITHUB_COLORS_LIGHT;
  return (
    <div className="w-full">
      <CalendarHeatmap
        colors={colors}
        data={calendarHeatmapSampleData}
        emptyColor={colors[0]}
        year={2026}
      />
    </div>
  );
}

export function CalendarHeatmapCustomTooltipDemo() {
  return (
    <div className="w-full">
      <CalendarHeatmap
        data={calendarHeatmapSampleData}
        renderTooltip={(datum, dateStr) => {
          if (datum !== undefined) {
            return (
              <div className="font-medium text-xs">
                {dateStr}: <strong>{datum.value} commits</strong>
              </div>
            );
          }
          return (
            <div className="text-muted-foreground text-xs">
              {dateStr}: no activity
            </div>
          );
        }}
        year={2026}
      />
    </div>
  );
}
