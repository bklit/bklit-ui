import type { Metadata } from "next";
import { HomeOgCard } from "@/components/og/home-og-card";
import { SITE_TITLE } from "@/lib/seo";

/**
 * Internal render target for `/api/og/home`: a tilted grid of the homepage
 * showcase charts as a 1200×630 card. Not linked anywhere; noindex,
 * `X-Robots-Tag` (next.config) and disallowed in robots.txt (`/og/`).
 */
export const metadata: Metadata = {
  title: "Home OG render",
  robots: { index: false, follow: false },
};

export default function HomeOgRenderPage() {
  return <HomeOgCard label={SITE_TITLE} />;
}
