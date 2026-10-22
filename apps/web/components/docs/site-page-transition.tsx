"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ViewTransition } from "react";

function getSiteTransitionKey(pathname: string) {
  if (pathname === "/docs" || pathname.startsWith("/docs/")) {
    return "/docs";
  }

  if (pathname === "/charts" || pathname.startsWith("/charts/")) {
    return "/charts";
  }

  // The changelog rewrites its URL while scrolling; never remount the feed.
  if (pathname === "/changelog" || pathname.startsWith("/changelog/")) {
    return "/changelog";
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
