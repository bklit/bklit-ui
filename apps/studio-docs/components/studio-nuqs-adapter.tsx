"use client";

import { processStudioUrlSearchParams } from "@bklitui/studio";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

export function StudioNuqsAdapter({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter processUrlSearchParams={processStudioUrlSearchParams}>
      {children}
    </NuqsAdapter>
  );
}
