import { notFound } from "next/navigation";
import { ChartExamplesGrid } from "@/components/charts/chart-examples";
import { validChartSlugs } from "@/components/charts/chart-slugs";

interface ChartPageProps {
  params: Promise<{ chart: string }>;
}

export function generateStaticParams() {
  return validChartSlugs.map((slug) => ({ chart: slug }));
}

export default async function ChartPage({ params }: ChartPageProps) {
  const { chart } = await params;

  if (!(validChartSlugs as readonly string[]).includes(chart)) {
    notFound();
  }

  return <ChartExamplesGrid chartSlug={chart} />;
}
