"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

export default function ChartsLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.style.scrollbarGutter = "stable";
    return () => {
      document.documentElement.style.scrollbarGutter = "";
    };
  }, []);

  return <div className="flex flex-1 flex-col">{children}</div>;
}
