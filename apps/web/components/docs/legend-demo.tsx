"use client";

import {
  Legend,
  LegendItemComponent,
  LegendLabel,
  LegendMarker,
  LegendProgress,
  LegendValue,
} from "@bklitui/ui/charts";

const sampleData = [
  { label: "Organic", value: 4250, maxValue: 5000, color: "#0ea5e9" },
  { label: "Paid", value: 3120, maxValue: 5000, color: "#a855f7" },
  { label: "Email", value: 2100, maxValue: 5000, color: "#f59e0b" },
  { label: "Social", value: 1580, maxValue: 5000, color: "#10b981" },
];

export function LegendSimpleDemo() {
  return (
    <div className="w-full max-w-xs">
      <Legend items={sampleData}>
        <LegendItemComponent className="flex items-center gap-3">
          <LegendMarker />
          <LegendLabel className="flex-1" />
          <LegendValue />
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

export function LegendProgressDemo() {
  return (
    <div className="w-full max-w-sm">
      <Legend items={sampleData} title="Sessions by Channel">
        <LegendItemComponent className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1">
          <LegendMarker />
          <LegendLabel />
          <LegendValue showPercentage />
          <div className="col-span-full">
            <LegendProgress />
          </div>
        </LegendItemComponent>
      </Legend>
    </div>
  );
}

export function LegendHorizontalDemo() {
  return (
    <div className="w-full">
      <Legend className="flex-row flex-wrap gap-4" items={sampleData}>
        <LegendItemComponent className="flex items-center gap-2">
          <LegendMarker className="h-2 w-2" />
          <LegendLabel className="text-xs" />
        </LegendItemComponent>
      </Legend>
    </div>
  );
}
