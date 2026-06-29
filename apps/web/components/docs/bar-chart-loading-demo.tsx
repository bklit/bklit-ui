"use client";

import { Bar, BarChart, BarXAxis, Grid } from "@bklitui/ui/charts";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const DATA_KEY = "revenue";

const readyData = [
  { month: "Jan", [DATA_KEY]: 12_000 },
  { month: "Feb", [DATA_KEY]: 15_500 },
  { month: "Mar", [DATA_KEY]: 11_000 },
  { month: "Apr", [DATA_KEY]: 18_500 },
  { month: "May", [DATA_KEY]: 16_800 },
  { month: "Jun", [DATA_KEY]: 21_200 },
];

/** Local preview for the bar chart loading skeleton (status="loading"). */
export function BarChartLoadingDemo() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setStatus("loading")}
          size="sm"
          variant={status === "loading" ? "default" : "outline"}
        >
          Loading
        </Button>
        <Button
          onClick={() => setStatus("ready")}
          size="sm"
          variant={status === "ready" ? "default" : "outline"}
        >
          Ready
        </Button>
      </div>
      <div className="w-full">
        <BarChart data={readyData} status={status} xDataKey="month">
          <Grid horizontal />
          <Bar dataKey={DATA_KEY} />
          <BarXAxis />
        </BarChart>
      </div>
    </div>
  );
}
