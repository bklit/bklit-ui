"use client";

import { StudioShell } from "@bklitui/studio";
import { Suspense } from "react";
import { SiteHeader } from "@/components/docs/site-header";
import { WebStudioCodeSheet } from "@/components/studio/web-studio-code-sheet";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import { siteNavLinks } from "@/lib/site-nav-links";

function StudioFallback() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16 text-muted-foreground text-sm">
      Loading studio…
    </div>
  );
}

export function StudioPageClient() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader
        discordUrl="https://discord.com/invite/9yyK8FwPcU"
        githubUrl="https://github.com/bklit/bklit-ui"
        links={[...siteNavLinks]}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden pt-14">
        <Suspense fallback={<StudioFallback />}>
          <StudioShell
            analytics={{
              track: trackEvent,
              getUrl: getAnalyticsUrl,
            }}
            renderCodeSheet={(state) => <WebStudioCodeSheet state={state} />}
          />
        </Suspense>
      </main>
    </div>
  );
}
