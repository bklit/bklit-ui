"use client";

import Link from "fumadocs-core/link";
import { HomeHeroSection } from "@/components/design/home-hero-section";
import { LineGrid } from "@/components/design/line-grid";
import { Button } from "@/components/ui/button";
import { showcaseSubmitUrl } from "@/lib/showcase/constants";

export function ShowcaseHero() {
  return (
    <HomeHeroSection>
      <div className="w-full overflow-visible pt-8 md:pt-16">
        <LineGrid
          className="aspect-3/1 [--grid-cell-height:calc(100%/1)] [--grid-cell-width:calc(100%/3)] md:aspect-4/1 md:[--grid-cell-width:calc(100%/4)]"
          columns={3}
          columnsMd={4}
          pulse
          pulseMaxActive={2}
          pulseMaxActiveMd={3}
          pulseMinActive={1}
          pulseMinActiveMd={2}
          rows={1}
          variant="solid"
        >
          <div
            className="pointer-events-none absolute inset-0 flex min-h-0 min-w-0 flex-col justify-center px-4 text-left sm:px-8 md:px-12"
            data-grid-fill
          >
            <div className="flex flex-col items-start gap-3 sm:gap-4">
              <div className="flex max-w-full flex-col items-start">
                <h1 className="font-bold text-2xl tracking-tight sm:text-4xl md:text-5xl">
                  Showcase
                </h1>
                <p className="font-mono text-muted-foreground text-xs uppercase tracking-widest sm:text-sm md:text-base">
                  Real dashboards and data experiences built with Bklit UI
                  <span className="animate-caret-blink">_</span>
                </p>
              </div>
              <div className="pointer-events-auto">
                <Button
                  nativeButton={false}
                  render={<Link external href={showcaseSubmitUrl} />}
                  size="lg"
                  variant="white"
                >
                  Submit yours
                </Button>
              </div>
            </div>
          </div>
        </LineGrid>
      </div>
    </HomeHeroSection>
  );
}
