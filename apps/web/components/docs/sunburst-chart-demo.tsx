"use client";

import {
  buildArcs,
  SunburstBreadcrumb,
  SunburstCenter,
  SunburstChart,
  SunburstHint,
  SunburstLabels,
  SunburstSegment,
} from "@bklitui/ui/charts";
import { useEffect, useMemo, useState } from "react";
import { sunburstDemoData } from "@/components/docs/sunburst-chart-demo-data";
import { SunburstDrillBreadcrumb } from "@/components/docs/sunburst-drill-breadcrumb";

export function SunburstChartDemo() {
  const { arcs, rootId } = useMemo(() => buildArcs(sunburstDemoData), []);
  const [focusId, setFocusId] = useState(rootId);

  useEffect(() => {
    setFocusId(rootId);
  }, [rootId]);

  return (
    <SunburstChart
      className="mx-auto"
      data={sunburstDemoData}
      focusId={focusId}
      onFocusChange={setFocusId}
      size={440}
    >
      <SunburstBreadcrumb>
        <SunburstDrillBreadcrumb />
      </SunburstBreadcrumb>
      {arcs.map((arc) => (
        <SunburstSegment index={arc.arcIndex} key={arc.id} />
      ))}
      <SunburstCenter />
      <SunburstLabels />
      <SunburstHint />
    </SunburstChart>
  );
}
