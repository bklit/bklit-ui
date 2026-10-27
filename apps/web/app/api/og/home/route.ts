import {
  captureOgCard,
  ogErrorResponse,
  requestOgFormat,
} from "@/lib/og-capture";

/**
 * Homepage Open Graph image: a headless Chrome screenshot of the internal
 * `/og/home` card (a tilted grid of the homepage showcase charts).
 * `?format=square` captures the 1200×1200 card at `/og/home/square`.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export function GET(request: Request) {
  const format = requestOgFormat(request);
  if (!format) {
    return ogErrorResponse(400, "Unknown format");
  }
  return captureOgCard(request, "home", format);
}
