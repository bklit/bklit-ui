import {
  chartLabels,
  loadStudioStateFromRequest,
  studioSerializedParam,
} from "@bklitui/studio";
import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site-url";
import { loadStudioOgFonts } from "@/lib/studio-og-fonts";
import {
  studioOgBackground,
  studioOgChartFadeGradient,
  studioOgForeground,
  studioOgMutedForeground,
} from "@/lib/studio-og-theme";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const size = { width: 1200, height: 630 };
const RIGHT_PADDING = 48;
const COLUMN_GAP = 40;
const TEXT_COLUMN_WIDTH = 340;
const CHART_PANEL_WIDTH =
  size.width - TEXT_COLUMN_WIDTH - COLUMN_GAP - RIGHT_PADDING;

function resolveOrigin(request: Request): string {
  if (process.env.NODE_ENV === "development") {
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") ?? "http";
    if (host) {
      return `${protocol}://${host}`;
    }
  }
  return SITE_URL;
}

function chartSubtitle(state: ReturnType<typeof loadStudioStateFromRequest>) {
  if (state.lineChartMode === "profitLoss") {
    return "Profit / Loss";
  }
  if (state.preset !== "default") {
    return `${state.preset} preset`;
  }
  return "bklit.com";
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const state = loadStudioStateFromRequest(url);
  const serialized = studioSerializedParam(state);
  const chartLabel = chartLabels[state.chart];
  const origin = resolveOrigin(request);
  const chartImageUrl = `${origin}/api/og/studio/chart?s=${encodeURIComponent(serialized)}`;
  const logoUrl = `${origin}/img/bklit-mark.svg`;
  const fonts = loadStudioOgFonts();

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: studioOgBackground,
        paddingTop: 0,
        paddingRight: RIGHT_PADDING,
        paddingBottom: 0,
        paddingLeft: 0,
        gap: COLUMN_GAP,
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "relative",
          width: CHART_PANEL_WIDTH,
          height: size.height,
          alignItems: "stretch",
          justifyContent: "flex-start",
          background: studioOgBackground,
          overflow: "hidden",
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: Satori OG layout requires native img */}
        <img
          alt=""
          height={size.height}
          src={chartImageUrl}
          style={{
            width: CHART_PANEL_WIDTH,
            height: size.height,
            objectFit: "cover",
            objectPosition: "left center",
          }}
          width={CHART_PANEL_WIDTH}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: CHART_PANEL_WIDTH * 0.5,
            height: size.height,
            background: studioOgChartFadeGradient,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: TEXT_COLUMN_WIDTH,
          color: studioOgForeground,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 28,
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: Satori OG layout requires native img */}
          <img alt="" height={56} src={logoUrl} width={36} />
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Bklit UI
          </div>
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 100,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: 16,
          }}
        >
          {chartLabel}
        </div>
        <div
          style={{
            fontSize: 22,
            color: studioOgMutedForeground,
            lineHeight: 1.4,
          }}
        >
          {chartSubtitle(state)}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}
