"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { BaselinePreview } from "./baseline-preview";
import { BenchmarkSection } from "./benchmark-section";
import { LAB_FIXTURES, resolveTarget } from "./fixtures";
import { PillPicker } from "./lab-controls";
import {
  isLabChartSlug,
  LAB_CHART_SLUGS,
  type LabChartSlug,
} from "./lab-slugs";
import { SweepSection } from "./sweep-section";

const CHART_OPTIONS = LAB_CHART_SLUGS.map((slug) => ({
  value: slug,
  label: `${LAB_FIXTURES[slug].label} (${LAB_FIXTURES[slug].variants.length})`,
}));

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
            <h1 className="font-semibold text-2xl">Chart regression lab</h1>
            <p className="max-w-3xl text-muted-foreground text-sm">
              Regression harness for <code>@bklitui/ui/charts</code>: every
              variant is compared against a golden baseline (
              <code>_baselines/{chart}/</code>) recorded on the pre-migration
              visx code, so the d3 charts must keep the same geometry, text,
              hover and interaction output. Hidden page: not on the production
              deployment.
            </p>
          </div>
        </div>
        <PillPicker
          label="Chart"
          onChange={(next) => select(next, null)}
          options={CHART_OPTIONS}
          value={chart}
        />
        <PillPicker
          label={`Variant (${fixture.variants.length})`}
          onChange={(next) => select(chart, next)}
          options={variantOptions}
          value={target.variant.id}
        />
      </header>
      <BaselinePreview key={`preview-${key}`} target={target} />
      <SweepSection chart={chart} onSelect={select} />
      <BenchmarkSection key={`bench-${key}`} target={target} />
    </>
  );
}
