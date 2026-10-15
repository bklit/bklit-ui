"use client";

import { Icon } from "@bklitui/icons";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { useEffect, useState } from "react";
import { markSearchOpenedFromClick } from "@/lib/analytics/search-source";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

function SearchShortcut() {
  const [modifier, setModifier] = useState("⌘");

  useEffect(() => {
    if (window.navigator.userAgent.includes("Windows")) {
      setModifier("Ctrl");
    }
  }, []);

  return (
    <span className="pointer-events-none hidden items-center gap-1 sm:inline-flex">
      <kbd className={kbdClassName}>{modifier}</kbd>
      <kbd className={cn(kbdClassName, "aspect-square")}>K</kbd>
    </span>
  );
}

/** coss Kbd look (https://coss.com/ui, MIT). */
const kbdClassName =
  "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center gap-1 rounded-[.25rem] bg-muted px-1 font-medium font-sans text-muted-foreground text-xs";

interface DocsSearchTriggerProps {
  className?: string;
  hideIfDisabled?: boolean;
}

export function DocsSearchTrigger({
  className,
  hideIfDisabled,
}: DocsSearchTriggerProps) {
  const { setOpenSearch, enabled } = useSearchContext();

  if (hideIfDisabled && !enabled) {
    return null;
  }

  return (
    <Button
      aria-label="Open search"
      className={className}
      data-search-full=""
      onClick={() => {
        markSearchOpenedFromClick();
        setOpenSearch(true);
      }}
      variant="outline"
    >
      <Icon className="size-4" name="IconQuickSearch" />
      <SearchShortcut />
    </Button>
  );
}
