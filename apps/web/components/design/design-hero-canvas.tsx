import Link from "next/link";
import { VercelOss } from "@/components/brands/vercel-oss";
import chartVariations from "@/components/charts/chart-variation-count.json";
import { Button } from "@/components/ui/button";

export function DesignHeroCanvas() {
  return (
    <div className="flex min-w-0 flex-col justify-center py-6 text-left sm:py-8 md:py-10 lg:py-12">
      <div className="flex min-h-0 flex-col gap-4 sm:gap-6">
        <div className="flex flex-col items-start gap-3 sm:gap-5">
          <h1 className="max-w-3xl text-balance font-bold font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
            Design engineered charts and data visualization
          </h1>
          <div className="flex flex-wrap items-start gap-2">
            <Button render={<Link href="/docs/installation" />} size="lg">
              Get started
            </Button>
            <Button
              className="max-sm:hidden"
              render={<Link href="/charts/area-chart" />}
              size="lg"
              variant="outline"
            >
              Browse {chartVariations.count} charts
            </Button>
          </div>
        </div>

        <div className="flex shrink-0 justify-start">
          <a
            className="inline-flex text-foreground"
            href="https://vercel.com/oss"
            rel="noopener noreferrer"
            target="_blank"
          >
            <VercelOss className="h-auto w-[150px] max-w-full sm:w-[200px] md:w-[240px]" />
          </a>
        </div>
      </div>
    </div>
  );
}
