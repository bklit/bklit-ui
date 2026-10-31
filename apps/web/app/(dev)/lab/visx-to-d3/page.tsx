import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LabClient } from "./lab-client";

/**
 * Hidden chart regression lab: every variant of the live charts
 * (`@bklitui/ui/charts`) is compared against a golden baseline
 * (`_baselines/`) recorded on the pre-migration visx code — SVG geometry, HTML
 * text and callbacks after enter, hover and scripted interaction steps — plus
 * an enter/hover benchmark against stored medians.
 *
 * The route keeps its `/lab/visx-to-d3` path: the baselines route handler,
 * next.config.mjs (`X-Robots-Tag`), robots.txt and existing links all point
 * at it, and the baselines are named after the migration they guarded.
 *
 * Hidden, not secret: available locally (`next dev` / `next start`) and on
 * Vercel preview deployments, `notFound()` on the production deployment
 * (`VERCEL_ENV === "production"`). Also noindex metadata, `X-Robots-Tag`
 * (next.config.mjs), disallowed in robots.txt, excluded from the sitemap and
 * not linked from anywhere.
 */
export const metadata: Metadata = {
  title: "Chart regression lab",
  robots: { index: false, follow: false },
};

export default function VisxToD3LabPage() {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 py-8">
      <Suspense fallback={null}>
        <LabClient />
      </Suspense>
    </main>
  );
}
