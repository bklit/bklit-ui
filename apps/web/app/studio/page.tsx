"use client";

import { StudioShell } from "@bklitui/studio";
import { Suspense } from "react";
import { WebStudioCodeSheet } from "@/components/studio/web-studio-code-sheet";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";

function StudioFallback() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16 text-muted-foreground text-sm">
      Loading studio…
    </div>
  );
}

export default function StudioPage() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <Suspense fallback={<StudioFallback />}>
        <StudioShell
          analytics={{
            track: trackEvent,
            getUrl: getAnalyticsUrl,
          }}
          renderCodeSheet={(state) => <WebStudioCodeSheet state={state} />}
        />
      </Suspense>
    </div>
  );
}
