"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { processStudioUrlSearchParams } from "@/lib/studio-url-nuqs";

export function StudioNuqsAdapter({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter processUrlSearchParams={processStudioUrlSearchParams}>
      {children}
    </NuqsAdapter>
  );
}
