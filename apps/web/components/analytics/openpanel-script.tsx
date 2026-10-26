import { getInitSnippet } from "@openpanel/nextjs";
import Script from "next/script";

const OPENPANEL_SDK_VERSION = "1.5.1";

/**
 * Same output as `@openpanel/nextjs`'s `OpenPanelComponent`, except the SDK
 * file loads with `lazyOnload` instead of `afterInteractive`. The stock
 * component's `afterInteractive` script adds a `<link rel="preload">` in
 * `<head>` that competes with the page's own JS and fonts on mobile.
 *
 * Tracking is unchanged: the inline init snippet installs a queueing
 * `window.op` stub right after hydration, so the `init` call and the first
 * screen view are buffered and flushed when the SDK arrives.
 */
export function OpenPanelScript({ clientId }: { clientId: string }) {
  const init = {
    apiUrl: "/api/op",
    clientId,
    trackAttributes: true,
    trackOutgoingLinks: true,
    trackScreenViews: true,
    sdk: "nextjs",
    sdkVersion: OPENPANEL_SDK_VERSION,
  };

  return (
    <>
      <Script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: OpenPanel queue stub + init call
        dangerouslySetInnerHTML={{
          __html: `${getInitSnippet()}\nwindow.op('init', ${JSON.stringify(init)});`,
        }}
        id="openpanel-init"
        strategy="afterInteractive"
      />
      <Script
        src={`/api/op/op1.js?v=${OPENPANEL_SDK_VERSION}`}
        strategy="lazyOnload"
      />
    </>
  );
}
