import { chartLabels } from "@bklitui/studio";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isChartSlug, validChartSlugs } from "@/components/charts/chart-slugs";
import { ChartOgCard } from "@/components/og/chart-og-card";

/**
 * Internal render target for `/api/og/charts/[chart]?format=square`: the
 * 1200×1200 card. Not linked anywhere; noindex, `X-Robots-Tag` (next.config)
 * and disallowed in robots.txt (`/og/`).
 */
export const metadata: Metadata = {
  title: "Chart OG render (square)",
  robots: { index: false, follow: false },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return validChartSlugs.map((chart) => ({ chart }));
}

interface PageProps {
  params: Promise<{ chart: string }>;
}

export default async function ChartOgSquareRenderPage({ params }: PageProps) {
  const { chart } = await params;
  if (!isChartSlug(chart)) {
    notFound();
  }
  return (
    <ChartOgCard format="square" label={chartLabels[chart]} slug={chart} />
  );
}
