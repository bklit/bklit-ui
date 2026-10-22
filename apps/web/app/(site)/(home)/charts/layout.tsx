"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { ChartNav } from "@/components/charts/chart-nav";
import {
  SiteDivider,
  SitePageHeader,
  siteContainerClassName,
} from "@/components/design/site-chrome";

export default function ChartsLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.style.scrollbarGutter = "stable";
    return () => {
      document.documentElement.style.scrollbarGutter = "";
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <SitePageHeader
        description="Copy-paste chart examples for every Bklit UI component."
        title="Charts"
      />
      <SiteDivider />
      <div className="flex flex-col gap-8 pt-8 pb-8 md:gap-12 md:pt-12">
        <section className={siteContainerClassName}>
          <ChartNav />
        </section>
        {children}
      </div>
    </div>
  );
}
