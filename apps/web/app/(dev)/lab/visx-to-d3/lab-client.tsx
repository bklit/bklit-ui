"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { BenchmarkSection } from "./benchmark-section";
import {
  isLabChartSlug,
  LAB_FIXTURES,
  type LabChartSlug,
  resolveTarget,
} from "./fixtures";
import { ChoiceControl, PillPicker } from "./lab-controls";
import { PreviewSection } from "./preview-section";
import { SweepSection } from "./sweep-section";

const CHART_OPTIONS = (Object.keys(LAB_FIXTURES) as LabChartSlug[]).map(
  (slug) => ({ value: slug, label: LAB_FIXTURES[slug].label })
);

export function LabClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const param = searchParams.get("chart");
  const chart: LabChartSlug = isLabChartSlug(param) ? param : "pie";
  const target = resolveTarget(chart, searchParams.get("variant"));
  const fixture = LAB_FIXTURES[chart];
  const variantOptions = fixture.variants.map((v) => ({
    value: v.id,
    label: v.label,
  }));

  const select = useCallback(
    (nextChart: LabChartSlug, nextVariant: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("chart", nextChart);
      if (nextVariant) {
        params.set("variant", nextVariant);
      } else {
        params.delete("variant");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const key = `${chart}:${target.variant.id}`;

  return (
    <>
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold text-2xl">visx → d3 lab</h1>
            <p className="max-w-2xl text-muted-foreground text-sm">
              Before is the frozen visx snapshot ({fixture.legacyParts} from{" "}
              <code>legacy-visx/</code>); After is the migrated d3 version from{" "}
              <code>@bklitui/ui/charts</code>. Same props, same data, same
              frame. Hidden page: not on the production deployment.
            </p>
          </div>
          <ChoiceControl
            label="Chart"
            onChange={(next) => select(next, null)}
            options={CHART_OPTIONS}
            value={chart}
          />
        </div>
        <PillPicker
          label={`Variant (${fixture.variants.length})`}
          onChange={(next) => select(chart, next)}
          options={variantOptions}
          value={target.variant.id}
        />
      </header>
      <PreviewSection key={`preview-${key}`} target={target} />
      <SweepSection chart={chart} onSelect={select} />
      <BenchmarkSection key={`bench-${key}`} target={target} />
    </>
  );
}
