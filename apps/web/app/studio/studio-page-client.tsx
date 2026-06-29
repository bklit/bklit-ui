"use client";

import { StudioShell } from "@bklitui/studio";
import { useTheme } from "next-themes";
import { Suspense } from "react";
import { SiteHeader } from "@/components/docs/site-header";
import { WebStudioCodeSheet } from "@/components/studio/web-studio-code-sheet";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import { siteNavLinks } from "@/lib/site-nav-links";

function StudioFallback() {
  return <div aria-hidden className="flex-1 bg-background" />;
}

export function StudioPageClient() {
  const { setTheme } = useTheme();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <SiteHeader
        discordUrl="https://discord.gg/75s4frfE8X"
        githubUrl="https://github.com/bklit/bklit-ui"
        links={[...siteNavLinks]}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background pt-18">
        <div className="flex min-h-0 flex-1 flex-col border-border border-t">
          <Suspense fallback={<StudioFallback />}>
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
      </main>
    </div>
  );
}
