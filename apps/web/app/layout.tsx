import { GithubStatsProvider } from "@/components/providers/github-stats-provider";
import "./globals.css";
import { RootProvider } from "fumadocs-ui/provider";
import { GeistMono } from "geist/font/mono";
import type { Metadata, Viewport } from "next";
import { Source_Serif_4 } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { OpenPanelScript } from "@/components/analytics/openpanel-script";
import { ChartThemeProvider } from "@/components/chart-theme/chart-theme-provider";
import { ChartThemeScript } from "@/components/chart-theme/chart-theme-script";
import { SiteLeftDotGrid } from "@/components/design/site-left-dot-grid";
import { DocsSearchDialogLazy } from "@/components/docs/docs-search-dialog-lazy";
import { getOpenPanelClientId } from "@/lib/openpanel-env";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";
import { cn } from "@/lib/utils";

/**
 * Cal Sans 2.010 variable font (OFL-1.1, see ./fonts/OFL.txt), loaded the
 * same way as coss ui (`@coss/ui/fonts` `fontSans`): one family for body and
 * headings, `--font-heading` aliases it in globals.css.
 *
 * Only the upright face is preloaded. The italic face is declared in
 * globals.css under the same `calSans` family name (derived from this const's
 * name: rename both together) so it loads only on pages that use italic.
 */
const calSans = localFont({
  display: "swap",
  src: [{ path: "./fonts/CalSansVF.woff2", style: "normal" }],
  variable: "--font-cal-sans",
  weight: "400 700",
});

/**
 * Paired serif until `geist/font/serif` ships in the geist package. Not used
 * above the fold, so it isn't preloaded: it downloads only if something
 * renders with `font-serif`.
 */
const geistSerif = Source_Serif_4({
  preload: false,
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "React charts",
    "shadcn/ui charts",
    "data visualization",
    "chart components",
    "visx",
    "Tailwind CSS",
    "dashboard charts",
  ],
  authors: [{ name: "Bklit", url: SITE_URL }],
  creator: "Bklit",
  publisher: "Bklit",
  // No root `alternates.canonical` / `openGraph.url`: they would be inherited
  // by every route that forgets to set its own. Pages set them via `pageMetadata`.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE.url, alt: DEFAULT_OG_IMAGE.alt }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const openPanelClientId = getOpenPanelClientId();

  return (
    <html
      className={cn(calSans.variable, GeistMono.variable, geistSerif.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <ChartThemeScript />
      </head>
      <body className="relative flex min-h-screen flex-col">
        <SiteLeftDotGrid />
        {openPanelClientId ? (
          <OpenPanelScript clientId={openPanelClientId} />
        ) : null}
        <GithubStatsProvider>
          <RootProvider
            search={{
              SearchDialog: DocsSearchDialogLazy,
              // Mount (and so download) the dialog on first open only.
              preload: false,
              options: {
                api: "/api/search",
              },
            }}
            theme={{
              attribute: "class",
              defaultTheme: "system",
              disableTransitionOnChange: true,
              enableSystem: true,
            }}
          >
            <ChartThemeProvider>{children}</ChartThemeProvider>
          </RootProvider>
        </GithubStatsProvider>
      </body>
    </html>
  );
}
