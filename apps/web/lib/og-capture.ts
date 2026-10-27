import { NextResponse } from "next/server";
import type { Browser, HTTPRequest, Page } from "puppeteer-core";
import {
  CHART_OG_CARD_ATTR,
  CHART_OG_READY_ATTR,
  CHART_OG_SIZES,
  type ChartOgFormat,
  chartOgRenderPath,
  isChartOgFormat,
} from "@/lib/chart-og";
import worldCountries from "@/lib/og-data/world-countries.json";
import { SITE_URL } from "@/lib/site-url";
import { launchStudioOgBrowser } from "@/lib/studio-og-chromium";
import { WORLD_DATA_URL } from "@/lib/world-data-url";

/**
 * Headless Chrome capture shared by the chart OG routes (`/api/og/charts/
 * [chart]`, `/api/og/home`): loads the internal render page, waits for its
 * ready signal and settled animations, and screenshots the card.
 *
 * Success is cached for a year (`?v=` in the og:image URL busts it when the
 * design changes). Any failure answers 503 with `no-store`, so a broken card
 * is never cached by the CDN or social crawlers.
 */

const NAVIGATION_TIMEOUT_MS = 20_000;
const READY_TIMEOUT_MS = 25_000;
const NETWORK_IDLE_TIMEOUT_MS = 5000;
const ANIMATIONS_TIMEOUT_MS = 4000;
/** Screenshot until two consecutive frames match (looping charts hit the cap). */
const STABLE_FRAME_INTERVAL_MS = 150;
const STABLE_FRAME_MAX_ATTEMPTS = 16;

const CARD_SELECTOR = `[${CHART_OG_CARD_ATTR}]`;
const READY_SELECTOR = `[${CHART_OG_CARD_ATTR}][${CHART_OG_READY_ATTR}="true"]`;

let worldDataBody: string | undefined;
let sharedBrowser: Browser | undefined;

async function getSharedBrowser(): Promise<Browser> {
  if (sharedBrowser?.connected) {
    return sharedBrowser;
  }
  sharedBrowser = await launchStudioOgBrowser();
  return sharedBrowser;
}

/**
 * Production renders screenshot the canonical site. Elsewhere (`next dev`,
 * local `next start`) the request's own origin serves the render page.
 */
function renderOrigin(request: Request): string {
  if (process.env.VERCEL === "1") {
    return SITE_URL;
  }
  return new URL(request.url).origin;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Only the render page's own origin loads. The choropleth's world data comes
 * from a bundled copy (no GitHub round trip), and analytics / third-party
 * requests are dropped.
 */
function handleRequest(request: HTTPRequest, origin: string) {
  const url = request.url();
  if (url === WORLD_DATA_URL) {
    worldDataBody ??= JSON.stringify(worldCountries);
    request.respond({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: worldDataBody,
    });
    return;
  }
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    request.continue();
    return;
  }
  const { origin: requestOrigin, pathname } = new URL(url);
  if (requestOrigin !== origin || pathname.startsWith("/api/op")) {
    request.abort();
    return;
  }
  request.continue();
}

/** Resolve once finite Web Animations (CSS + WAAPI) have finished. */
async function waitForAnimations(page: Page) {
  await Promise.race([
    page.evaluate(async () => {
      const finite = document.getAnimations().filter((animation) => {
        const iterations = animation.effect?.getComputedTiming().iterations;
        return iterations !== Number.POSITIVE_INFINITY;
      });
      await Promise.all(
        finite.map((animation) => animation.finished.catch(() => undefined))
      );
    }),
    sleep(ANIMATIONS_TIMEOUT_MS),
  ]);
}

async function captureStableCard(page: Page): Promise<Uint8Array> {
  const card = await page.$(CARD_SELECTOR);
  if (!card) {
    throw new Error("OG card root not found");
  }
  let previous: Uint8Array | undefined;
  for (let attempt = 0; attempt < STABLE_FRAME_MAX_ATTEMPTS; attempt++) {
    const frame = await card.screenshot({ type: "png" });
    if (previous && Buffer.compare(previous, frame) === 0) {
      return frame;
    }
    previous = frame;
    await sleep(STABLE_FRAME_INTERVAL_MS);
  }
  if (!previous) {
    throw new Error("OG card screenshot failed");
  }
  return previous;
}

export function ogErrorResponse(status: number, error: string) {
  return NextResponse.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

/** `?format=` from the request (`wide` when absent), or `null` if unknown. */
export function requestOgFormat(request: Request): ChartOgFormat | null {
  const format = new URL(request.url).searchParams.get("format") ?? "wide";
  return isChartOgFormat(format) ? format : null;
}

/**
 * Screenshot the render page for `subject` (a chart slug, or `"home"`) in
 * `format` and answer with the PNG, or a 503 `no-store` error.
 */
export async function captureOgCard(
  request: Request,
  subject: string,
  format: ChartOgFormat
): Promise<NextResponse> {
  const origin = renderOrigin(request);
  const renderUrl = `${origin}${chartOgRenderPath(subject, format)}`;

  let page: Page | undefined;
  try {
    const browser = await getSharedBrowser();
    page = await browser.newPage();
    await page.setViewport({
      ...CHART_OG_SIZES[format],
      deviceScaleFactor: 1,
    });
    await page.emulateMediaFeatures([
      // Dark cards: the site follows the system theme, and this page has no
      // stored preference, so the emulated scheme decides.
      { name: "prefers-color-scheme", value: "dark" },
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    await page.setRequestInterception(true);
    page.on("request", (pending) => handleRequest(pending, origin));

    const response = await page.goto(renderUrl, {
      waitUntil: "domcontentloaded",
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    if (!response?.ok()) {
      throw new Error(`Render page answered ${response?.status() ?? "none"}`);
    }
    await page.waitForSelector(READY_SELECTOR, { timeout: READY_TIMEOUT_MS });
    await page
      .waitForNetworkIdle({ idleTime: 250, timeout: NETWORK_IDLE_TIMEOUT_MS })
      .catch(() => undefined);
    // `next dev` overlay badge; absent in production.
    await page.evaluate(() => {
      for (const node of document.querySelectorAll("nextjs-portal")) {
        node.remove();
      }
    });
    await waitForAnimations(page);

    const png = await captureStableCard(page);
    return new NextResponse(Buffer.from(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(`OG capture failed (${subject}, ${format}):`, error);
    return ogErrorResponse(503, "Failed to render OG image");
  } finally {
    await page?.close().catch(() => undefined);
  }
}
