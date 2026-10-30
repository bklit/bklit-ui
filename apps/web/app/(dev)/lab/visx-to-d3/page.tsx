import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LabClient } from "./lab-client";

/**
 * Hidden visx → d3 migration lab: Before (frozen visx snapshot in
 * `@bklitui/ui/charts/legacy-visx`) vs After (`@bklitui/ui/charts`) previews,
 * a geometry parity check and an enter/hover benchmark runner.
 *
 * Hidden, not secret: available locally (`next dev` / `next start`) and on
 * Vercel preview deployments, `notFound()` on the production deployment
 * (`VERCEL_ENV === "production"`). Also noindex metadata, `X-Robots-Tag`
 * (next.config.mjs), disallowed in robots.txt, excluded from the sitemap and
 * not linked from anywhere. Delete together with `legacy-visx/` once the
 * migration is done.
 */
export const metadata: Metadata = {
  title: "visx → d3 lab",
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
