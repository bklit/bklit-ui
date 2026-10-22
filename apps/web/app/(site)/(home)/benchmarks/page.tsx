import type { Metadata } from "next";
import { BenchmarkPageClient } from "@/components/benchmarks/benchmark-page-client";
import { SiteDivider, SitePageHeader } from "@/components/design/site-chrome";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Chart Performance Benchmarks",
  description:
    "Run live, in-browser performance benchmarks of Bklit UI charts against Recharts and TanStack Charts: mount, update, hover, and DOM size.",
  path: "/benchmarks",
});

export default function BenchmarksPage() {
  return (
    <main className="flex flex-1 flex-col">
      <SitePageHeader
        description={
          <>
            Compare Bklit UI against Recharts and TanStack Charts on your own
            device. Every run uses the same seeded data, size, and chart type.
            Enter animations are shown for reference but never counted in the
            scores.
            <span className="mt-3 block text-muted-foreground/80 text-sm">
              This is a basic, informal comparison, not an official benchmark.
              Results depend on your device and browser, and on how each chart
              is configured here, so they may not be fully accurate or show any
              library at its best. Recharts and TanStack Charts are both
              excellent libraries; see their docs for recommended setups.
            </span>
          </>
        }
        title="Benchmarks"
      />
      <SiteDivider />
      <BenchmarkPageClient />
    </main>
  );
}
