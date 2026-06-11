"use client";

import { DocsSearchTrigger } from "@/components/docs-search-trigger";
import { ModeToggle } from "@/components/mode-toggle";

export function DocsToolbar() {
  return (
    <div className="flex items-center gap-2">
      <DocsSearchTrigger />
      <ModeToggle />
      <a
        className="text-muted-foreground text-sm hover:text-foreground"
        href="http://localhost:3000/studio"
        rel="noreferrer"
      >
        Studio
      </a>
    </div>
  );
}
