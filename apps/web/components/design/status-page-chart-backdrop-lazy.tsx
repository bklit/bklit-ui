"use client";

import dynamic from "next/dynamic";

/**
 * The status-page chart backdrop, split into its own chunk.
 *
 * `StatusPage` renders inside the error boundaries, and Next loads every
 * boundary's client code up front on every page. Imported statically, the
 * backdrop pulled a second copy of the chart primitives, d3 and motion into
 * each page load just in case an error happened. Through `next/dynamic` the
 * chunk loads only when a status page actually renders (and is still
 * server-rendered for the 404 page).
 */
export const StatusPageChartBackdrop = dynamic(() =>
  import("@/components/design/status-page-chart-backdrop").then(
    (mod) => mod.StatusPageChartBackdrop
  )
);
