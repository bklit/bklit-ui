"use client";

import { StudioShell } from "@bklitui/studio";
import { useTheme } from "next-themes";
import { Suspense } from "react";
import { WebStudioCodeSheet } from "@/components/studio/web-studio-code-sheet";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";

function StudioDemoFallback() {
  return <div aria-hidden className="flex-1 bg-background" />;
}

export function StudioDemoPageClient() {
  const { setTheme } = useTheme();

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <Suspense fallback={<StudioDemoFallback />}>
        <StudioShell
          analytics={{
            track: trackEvent,
            getUrl: getAnalyticsUrl,
          }}
          onThemeChange={setTheme}
          renderCodeSheet={(state) => <WebStudioCodeSheet state={state} />}
        />
      </Suspense>
    </div>
  );
}
