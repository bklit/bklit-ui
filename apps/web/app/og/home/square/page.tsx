import type { Metadata } from "next";
import { HomeOgCard } from "@/components/og/home-og-card";
import { SITE_TITLE } from "@/lib/seo";

/**
 * Internal render target for `/api/og/home?format=square`: the 1200×1200
 * card. Not linked anywhere; noindex, `X-Robots-Tag` (next.config) and
 * disallowed in robots.txt (`/og/`).
 */
export const metadata: Metadata = {
  title: "Home OG render (square)",
  robots: { index: false, follow: false },
};

export default function HomeOgSquareRenderPage() {
  return <HomeOgCard format="square" label={SITE_TITLE} />;
}
