"use client";

import { Suspense } from "react";
import { StudioShell } from "@/components/studio/studio-shell";

function StudioFallback() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16 text-muted-foreground text-sm">
      Loading studio…
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<StudioFallback />}>
      <StudioShell />
    </Suspense>
  );
}
