"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isQuietUrl } from "@/lib/quiet-url";

export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    // URL synced in place (changelog scroll-spy) — not a navigation.
    if (isQuietUrl(pathname)) {
      return;
    }
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    // pathname is the navigation trigger — not read in the effect body
  }, [pathname]);

  return null;
}
