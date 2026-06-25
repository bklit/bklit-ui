"use client";

import { GridCornerDots } from "@/components/design/line-grid";
import { ShowcaseCard } from "@/components/showcase/showcase-card";
import { ShowcaseProjectPanel } from "@/components/showcase/showcase-project-panel";
import { ShowcaseSubmitCard } from "@/components/showcase/showcase-submit-card";
import { showcaseProjects } from "@/lib/showcase/projects";

const columnsPerRow = 3;

function chunkItems<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
}

type ShowcaseGridItem =
  | { type: "project"; key: string; project: (typeof showcaseProjects)[number] }
  | { type: "submit"; key: string };

const showcaseItems: ShowcaseGridItem[] = [
  ...showcaseProjects.map((project) => ({
    type: "project" as const,
    key: project.url,
    project,
  })),
  { type: "submit", key: "submit" },
];

export function ShowcaseGrid() {
  const itemRows = chunkItems(showcaseItems, columnsPerRow);

  return (
    <section aria-label="Community showcase" className="w-full">
      <div className="relative flex w-full flex-col overflow-visible border-border border-t border-l">
        {itemRows.map((rowItems) => (
          <div
            className="relative w-full overflow-visible"
            key={rowItems.map((item) => item.key).join("-")}
          >
            <div className="grid grid-cols-1 overflow-visible md:grid-cols-3">
              {rowItems.map((item) => (
                <ShowcaseProjectPanel
                  className="min-w-0"
                  key={item.key}
                  showMobileCornerDots
                >
                  {item.type === "project" ? (
                    <ShowcaseCard embedded project={item.project} />
                  ) : (
                    <ShowcaseSubmitCard embedded />
                  )}
                </ShowcaseProjectPanel>
              ))}
            </div>
            <GridCornerDots
              className="z-3 hidden md:block"
              columns={rowItems.length}
              rows={1}
            />
          </div>
        ))}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          data-grid-rulers
        >
          <div className="absolute -top-8 left-0 block h-10 w-px bg-muted-foreground/40" />
          <div className="absolute top-0 -left-8 block h-px w-10 bg-muted-foreground/40" />
          <div className="absolute -top-8 right-0 block h-10 w-px bg-muted-foreground/40" />
          <div className="absolute top-0 -right-8 block h-px w-10 bg-muted-foreground/40" />

          <div className="absolute -bottom-8 left-0 block h-10 w-px bg-muted-foreground/40" />
          <div className="absolute bottom-0 -left-8 block h-px w-10 bg-muted-foreground/40" />
          <div className="absolute right-0 -bottom-8 block h-10 w-px bg-muted-foreground/40" />
          <div className="absolute -right-8 bottom-0 block h-px w-10 bg-muted-foreground/40" />

          <div className="absolute -top-8 -right-8 block h-6 w-6 bg-[repeating-linear-gradient(45deg,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_0,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_1px,transparent_0,transparent_50%)] bg-size-[5px_5px] bg-fixed opacity-80" />
          <div className="absolute -bottom-8 -left-8 block h-6 w-6 bg-[repeating-linear-gradient(45deg,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_0,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_1px,transparent_0,transparent_50%)] bg-size-[5px_5px] bg-fixed opacity-80" />
        </div>
      </div>
    </section>
  );
}
