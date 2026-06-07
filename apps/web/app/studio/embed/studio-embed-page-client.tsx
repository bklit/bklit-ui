"use client";

import { StudioEmbedShell } from "@bklitui/studio";
import { Suspense } from "react";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";

function StudioEmbedFallback() {
  return (
    <div className="flex h-dvh items-center justify-center px-6 text-muted-foreground text-sm">
      Loading chart…
    </div>
  );
}

export function StudioEmbedPageClient() {
  return (
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <Suspense fallback={<StudioEmbedFallback />}>
        <StudioEmbedShell
          analytics={{
            track: trackEvent,
            getUrl: getAnalyticsUrl,
          }}
        />
      </Suspense>
    </main>
  );
}
