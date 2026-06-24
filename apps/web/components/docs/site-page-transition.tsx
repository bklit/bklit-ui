"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ViewTransition } from "react";

function getSiteTransitionKey(pathname: string) {
  if (pathname === "/docs" || pathname.startsWith("/docs/")) {
    return "/docs";
  }

  return pathname;
}

export function SitePageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <ViewTransition
      default="none"
      enter="page-fade"
      exit="page-fade"
      key={getSiteTransitionKey(pathname)}
    >
      {children}
    </ViewTransition>
  );
}
