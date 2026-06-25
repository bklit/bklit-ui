"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ViewTransition } from "react";

export function ChartsPageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <ViewTransition
      default="none"
      enter="page-fade"
      exit="page-fade"
      key={pathname}
    >
      {children}
    </ViewTransition>
  );
}
