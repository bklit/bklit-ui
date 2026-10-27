import { isChartSlug } from "@/components/charts/chart-slugs";
import {
  captureOgCard,
  ogErrorResponse,
  requestOgFormat,
} from "@/lib/og-capture";

/**
 * `/charts/[chart]` Open Graph image: a headless Chrome screenshot of the
 * internal `/og/charts/[chart]` card (the page's examples on a perspective
 * floor). `?format=square` captures the 1200×1200 card at
 * `/og/charts/[chart]/square` instead of the 1200×630 letterbox card.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chart: string }> }
) {
  const { chart } = await params;
  if (!isChartSlug(chart)) {
    return ogErrorResponse(404, "Unknown chart");
  }
  const format = requestOgFormat(request);
  if (!format) {
    return ogErrorResponse(400, "Unknown format");
  }
  return captureOgCard(request, chart, format);
}
