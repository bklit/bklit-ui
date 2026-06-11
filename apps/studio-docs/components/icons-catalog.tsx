"use client";

import { Icon, type IconName } from "@bklitui/icons";
import { useDeferredValue, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export function IconsCatalog({ names }: { names: string[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filtered = useMemo(() => {
    if (!deferredQuery) {
      return names;
    }
    return names.filter((name) => name.toLowerCase().includes(deferredQuery));
  }, [deferredQuery, names]);

  return (
    <div className="not-prose space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-muted-foreground text-sm">
          {filtered.length.toLocaleString()} of {names.length.toLocaleString()}{" "}
          icons
        </p>
        <input
          aria-label="Filter icons"
          className={cn(
            "h-9 w-full max-w-xs rounded-lg border border-input bg-background px-3 text-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          )}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by name…"
          type="search"
          value={query}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-1.5">
        {filtered.map((name) => (
          <div
            className="flex aspect-square min-w-[48px] flex-col items-center justify-between rounded-md border border-border/60 bg-muted/20 p-0.5 text-center [content-visibility:auto]"
            key={name}
            title={name}
          >
            <div className="flex size-12 shrink-0 items-center justify-center text-foreground">
              <Icon className="size-5" name={name as IconName} />
            </div>
            <span className="max-w-full truncate px-0.5 font-mono text-[8px] text-muted-foreground leading-none">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
