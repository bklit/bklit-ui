"use client";

import Link from "fumadocs-core/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { DocsSearchTrigger } from "@/components/docs-search-trigger";
import { BklitLogo } from "@/components/icons/bklit";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoTheme = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <header className="fixed top-0 right-0 left-0 z-50 h-14 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-full items-center justify-between gap-6 px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            className="flex shrink-0 items-center no-underline transition-opacity hover:opacity-80"
            href="/docs"
          >
            <BklitLogo size={24} theme={logoTheme} />
          </Link>
          <div className="min-w-0">
            <Link
              className="font-semibold text-foreground text-sm tracking-tight no-underline transition-opacity hover:opacity-80"
              href="/docs"
            >
              Studio UI
            </Link>
            <span className="ml-2 hidden text-muted-foreground text-xs sm:inline">
              local docs
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <DocsSearchTrigger className="hidden w-30 justify-between md:inline-flex" />
          <Link
            className={cn(
              "hidden rounded-md px-3 py-1.5 font-medium text-muted-foreground text-xs no-underline transition-colors hover:bg-accent hover:text-foreground md:inline-flex",
              "aria-[current=page]:bg-accent aria-[current=page]:text-foreground"
            )}
            href="/catalog"
          >
            Catalog
          </Link>
          <Link
            className={cn(
              "hidden rounded-md px-3 py-1.5 font-medium text-muted-foreground text-xs no-underline transition-colors hover:bg-accent hover:text-foreground md:inline-flex"
            )}
            href="http://localhost:3000/studio"
            rel="noreferrer"
            target="_blank"
          >
            Open Studio
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
