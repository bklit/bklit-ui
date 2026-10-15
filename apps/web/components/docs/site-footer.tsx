"use client";

import Link from "fumadocs-core/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  SiteDivider,
  siteContainerClassName,
} from "@/components/design/site-chrome";
import { cn } from "@/lib/utils";
import { BklitLogo } from "../icons/bklit";

export function SiteFooter() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoTheme = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <footer className="mt-8 text-muted-foreground">
      <SiteDivider />
      <div
        className={cn(
          siteContainerClassName,
          "flex items-center justify-center gap-2 py-6"
        )}
      >
        <BklitLogo size={16} theme={logoTheme} />
        <span className="text-sm">
          built by{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            external
            href="https://x.com/uixmat"
          >
            uixmat
          </Link>
        </span>
      </div>
    </footer>
  );
}
