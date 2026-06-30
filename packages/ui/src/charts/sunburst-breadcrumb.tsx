"use client";

import { memo, type ReactNode, useMemo } from "react";
import type { Focus } from "./sunburst";
import { useSunburstStable } from "./sunburst-context";

export interface SunburstBreadcrumbItem {
  id: string;
  label: string;
  isCurrent: boolean;
}

export function useSunburstBreadcrumbItems() {
  const { data, focus, focusById, rootId, zoomTo } = useSunburstStable();

  const items = useMemo((): SunburstBreadcrumbItem[] => {
    const crumbs: Focus[] = [];
    let cur: Focus | undefined = focus;
    while (cur) {
      crumbs.unshift(cur);
      cur = cur.parentId ? focusById.get(cur.parentId) : undefined;
    }

    return crumbs.map((c, index) => ({
      id: c.id,
      label: c.id === rootId ? data.name : c.name,
      isCurrent: index === crumbs.length - 1,
    }));
  }, [data.name, focus, focusById, rootId]);

  return { items, zoomTo };
}

export interface SunburstBreadcrumbProps {
  className?: string;
  children: ReactNode;
}

export const SunburstBreadcrumb = memo(function SunburstBreadcrumb({
  className,
  children,
}: SunburstBreadcrumbProps) {
  return (
    <nav aria-label="Drill-down path" className={className ?? "mb-4"}>
      {children}
    </nav>
  );
});

SunburstBreadcrumb.displayName = "SunburstBreadcrumb";
