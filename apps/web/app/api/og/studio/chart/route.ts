import {
  loadStudioStateFromRequest,
  STUDIO_OG_CAPTURE_ROOT_ATTR,
  studioSerializedParam,
} from "@bklitui/studio";

const STUDIO_OG_CAPTURE_SELECTOR = `[${STUDIO_OG_CAPTURE_ROOT_ATTR}]`;

import { NextResponse } from "next/server";
import type { Browser } from "puppeteer-core";
import { SITE_URL } from "@/lib/site-url";
import { launchStudioOgBrowser } from "@/lib/studio-og-chromium";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OG_READY_TIMEOUT_MS = 10_000;
/** Retina capture multiplier — keep in sync with `OG_PREVIEW_MAX_WIDTH` in studio-og-preview */
const CHART_DEVICE_SCALE_FACTOR = 3;

function resolvePreviewOrigin(request: Request): string {
  if (process.env.NODE_ENV === "development") {
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") ?? "http";
    if (host) {
      return `${protocol}://${host}`;
    }
  }
  return SITE_URL;
}

function canonicalSearchParam(request: Request): string {
  const url = new URL(request.url);
  const state = loadStudioStateFromRequest(url);
  return studioSerializedParam(state);
}

export async function GET(request: Request) {
  const serialized = canonicalSearchParam(request);
  const previewUrl = `${resolvePreviewOrigin(request)}/studio/og-preview?s=${encodeURIComponent(serialized)}`;

  let browser: Browser | undefined;
  try {
    browser = await launchStudioOgBrowser();
    const page = await browser.newPage();
    await page.setViewport({
      width: 1800,
      height: 1200,
      deviceScaleFactor: CHART_DEVICE_SCALE_FACTOR,
    });
    await page.goto(previewUrl, { waitUntil: "networkidle0", timeout: 15_000 });
    await page.waitForSelector('[data-og-ready="true"]', {
      timeout: OG_READY_TIMEOUT_MS,
    });

    const exportRoot = await page.$(STUDIO_OG_CAPTURE_SELECTOR);
    if (!exportRoot) {
      throw new Error("Studio export root not found");
    }

    const screenshot = await exportRoot.screenshot({ type: "png" });
    if (!screenshot) {
      throw new Error("Failed to capture chart screenshot");
    }

    const body = Buffer.from(screenshot);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Studio OG chart screenshot failed:", error);
    return NextResponse.json(
      { error: "Failed to generate chart screenshot" },
      { status: 500 }
    );
  } finally {
    await browser?.close();
  }
}
