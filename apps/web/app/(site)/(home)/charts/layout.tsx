"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { ChartNav } from "@/components/charts/chart-nav";

export default function ChartsLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.style.scrollbarGutter = "stable";
    return () => {
      document.documentElement.style.scrollbarGutter = "";
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col space-y-24 pt-8 pb-16 md:pt-16 md:pb-24">
      <section className="relative w-full">
        <div className="container mx-auto w-full overflow-visible">
          <ChartNav />
        </div>
      </section>
      {children}
    </div>
  );
}
