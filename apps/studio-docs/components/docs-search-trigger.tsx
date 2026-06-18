"use client";

import { Icon } from "@bklitui/icons";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function SearchShortcut() {
  const [modifier, setModifier] = useState("⌘");

  useEffect(() => {
    if (window.navigator.userAgent.includes("Windows")) {
      setModifier("Ctrl");
    }
  }, []);

  return (
    <kbd className="pointer-events-none hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-medium font-mono text-[0.625rem] text-muted-foreground sm:inline-flex">
      <span>{modifier}</span>
      <span>K</span>
    </kbd>
  );
}

export function DocsSearchTrigger({ className }: { className?: string }) {
  const { setOpenSearch } = useSearchContext();

  return (
    <button
      aria-label="Open search"
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-input bg-input/20 px-2 text-xs/relaxed outline-none transition-colors hover:bg-input/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-input/30",
        className
      )}
      data-search-full=""
      onClick={() => setOpenSearch(true)}
      type="button"
    >
      <Icon className="size-3.5 text-muted-foreground" name="IconQuickSearch" />
      <SearchShortcut />
    </button>
  );
}
