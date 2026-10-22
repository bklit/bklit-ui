import { chartLabels } from "@bklitui/studio";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChartExamplesGrid } from "@/components/charts/chart-examples";
import {
  type ChartSlug,
  isChartSlug,
  validChartSlugs,
} from "@/components/charts/chart-slugs";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, chartOgImage, pageMetadata } from "@/lib/seo";
import { source } from "@/lib/source";

const TRAILING_PERIOD_RE = /\.$/;

interface ChartPageProps {
  params: Promise<{ chart: string }>;
}

export function generateStaticParams() {
  return validChartSlugs.map((slug) => ({ chart: slug }));
}

function chartTitle(slug: ChartSlug) {
  return `${chartLabels[slug]} Examples`;
}

function chartDescription(slug: ChartSlug) {
  const label = chartLabels[slug];
  const docsDescription = source.getPage(["components", slug])?.data
    .description;
  const lead = `Copy-paste ${label} examples for React, built with Bklit UI and shadcn/ui.`;
  return docsDescription
    ? `${lead} ${docsDescription.replace(TRAILING_PERIOD_RE, "")}.`
    : lead;
}

export async function generateMetadata({
  params,
}: ChartPageProps): Promise<Metadata> {
  const { chart } = await params;
  if (!isChartSlug(chart)) {
    notFound();
  }

  const title = chartTitle(chart);
  return pageMetadata({
    title,
    description: chartDescription(chart),
    path: `/charts/${chart}`,
    images: [chartOgImage(chart, `${title} | Bklit UI`)],
  });
}

export default async function ChartPage({ params }: ChartPageProps) {
  const { chart } = await params;

  if (!isChartSlug(chart)) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: chartTitle(chart), path: `/charts/${chart}` },
        ])}
      />
      <ChartExamplesGrid chartSlug={chart} />
    </>
  );
}
