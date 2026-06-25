"use client";

import type { ReactNode } from "react";
import { HomeHeroSection } from "@/components/design/home-hero-section";
import { LineGrid } from "@/components/design/line-grid";
import { cn } from "@/lib/utils";

export function SubPageHeroGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <HomeHeroSection>
      <div className="w-full overflow-visible pt-8 md:pt-16">
        <LineGrid
          className={cn(
            "aspect-3/1 [--grid-cell-height:calc(100%/1)] [--grid-cell-width:calc(100%/3)] md:aspect-4/1 md:[--grid-cell-width:calc(100%/4)]",
            className
          )}
          columns={3}
          columnsMd={4}
          pulse
          pulseMaxActive={0}
          pulseMinActive={0}
          pulseStaticCells={[{ col: 0, row: 0 }]}
          rows={1}
          variant="solid"
        >
          {children}
        </LineGrid>
      </div>
    </HomeHeroSection>
  );
}

export function GridPageHero({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <SubPageHeroGrid>
      <div
        className="pointer-events-none absolute inset-0 flex min-h-0 min-w-0 flex-col justify-center px-4 text-left sm:px-8 md:px-12"
        data-grid-fill
      >
        <div className="flex flex-col items-start gap-3 sm:gap-4">
          <div className="flex max-w-full flex-col items-start">
            <h1 className="font-bold text-2xl tracking-tight sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="font-mono text-muted-foreground text-xs uppercase tracking-widest sm:text-sm md:text-base">
              {subtitle}
              <span className="animate-caret-blink">_</span>
            </p>
          </div>
          {action ? <div className="pointer-events-auto">{action}</div> : null}
        </div>
      </div>
    </SubPageHeroGrid>
  );
}
