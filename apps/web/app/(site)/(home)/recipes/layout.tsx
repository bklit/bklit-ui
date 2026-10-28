"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { useEffect } from "react";

export default function RecipesLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.style.scrollbarGutter = "stable";
    return () => {
      document.documentElement.style.scrollbarGutter = "";
    };
  }, []);

  return (
    <NuqsAdapter>
      <div className="flex flex-1 flex-col">{children}</div>
    </NuqsAdapter>
  );
}
