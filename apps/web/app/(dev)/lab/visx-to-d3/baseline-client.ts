"use client";

import {
  type BaselineBenchmark,
  type BaselineFile,
  type LiveCapture,
  packSteps,
} from "./bench/baseline";
import type { LabTarget } from "./fixtures";
import { BASELINE_SCHEMA } from "./lab-slugs";

/** Client side of `baseline-store/route.ts` (dev only). */

const ENDPOINT = "/lab/visx-to-d3/baseline-store";

export type BaselineIndex = Record<string, string[]>;

/** `null` when the store is unavailable (not `next dev`). */
export async function fetchBaselineIndex(): Promise<BaselineIndex | null> {
  const response = await fetch(`${ENDPOINT}?index=1`, { cache: "no-store" });
  return response.ok ? ((await response.json()) as BaselineIndex) : null;
}

export function hasBaseline(
  index: BaselineIndex | null,
  chart: string,
  variant: string
): boolean {
  return index?.[chart]?.includes(variant) ?? false;
}

/** `null` when missing. */
export async function fetchBaseline(
  chart: string,
  variant: string
): Promise<BaselineFile | null> {
  const params = new URLSearchParams({ chart, variant });
  const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
    cache: "no-store",
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Baseline read failed: ${response.status}`);
  }
  return (await response.json()) as BaselineFile;
}

async function post(body: unknown): Promise<void> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      detail?.error ?? `Baseline write failed: ${response.status}`
    );
  }
}

/** Browser half of the machine label (the route adds host + CPU). */
export function browserMachine(): string {
  return `${navigator.hardwareConcurrency} threads · DPR ${window.devicePixelRatio}`;
}

export function buildBaselineFile(
  target: LabTarget,
  capture: LiveCapture
): BaselineFile {
  return {
    schema: BASELINE_SCHEMA,
    chart: target.chart,
    variant: target.variant.id,
    label: target.variant.label,
    frame: { width: target.width, height: target.height },
    recordedAt: new Date().toISOString(),
    machine: browserMachine(),
    userAgent: navigator.userAgent,
    hover: target.hover,
    hoverTargetCount: capture.hoverTargetCount,
    interactions: target.interactions !== null,
    steps: packSteps(capture.steps),
  };
}

export function saveBaseline(baseline: BaselineFile): Promise<void> {
  return post({ action: "geometry", baseline });
}

export function saveBenchmark(
  chart: string,
  variant: string,
  benchmark: BaselineBenchmark
): Promise<void> {
  return post({ action: "benchmark", chart, variant, benchmark });
}
