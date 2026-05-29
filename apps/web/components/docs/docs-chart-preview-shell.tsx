"use client";

import { StaticChartPreviewProvider } from "@bklitui/ui/charts";
import type { ReactNode } from "react";

/** Docs preview shell — disables cartesian reveal clip-path on nested charts. */
export function DocsChartPreviewShell({ children }: { children: ReactNode }) {
  return <StaticChartPreviewProvider>{children}</StaticChartPreviewProvider>;
}
