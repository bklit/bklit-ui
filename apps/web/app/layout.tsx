import { GithubStatsProvider } from "@/components/providers/github-stats-provider";
import "./globals.css";
import { OpenPanelComponent } from "@openpanel/nextjs";
import { RootProvider } from "fumadocs-ui/provider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";
import { SiteLeftDotGrid } from "@/components/design/site-left-dot-grid";
import { DocsSearchDialog } from "@/components/docs/docs-search-dialog";
import { getOpenPanelClientId } from "@/lib/openpanel-env";
import { SITE_URL } from "@/lib/site-url";
import { cn } from "@/lib/utils";

/** Paired serif until `geist/font/serif` ships in the geist package. */
const geistSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bklit UI - Charts & Data Visualization Components",
    template: "%s | Bklit UI",
  },
  description:
    "Bklit UI is a component library built on top of shadcn/ui to help you build charts and data visualizations more easily.",
  openGraph: {
    title: "Bklit UI - Charts & Data Visualization Components",
    description:
      "Bklit UI is a component library built on top of shadcn/ui to help you build charts and data visualizations more easily.",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Bklit UI - Charts & Data Visualization Components",
    description:
      "Bklit UI is a component library built on top of shadcn/ui to help you build charts and data visualizations more easily.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const openPanelClientId = getOpenPanelClientId();

  return (
    <html
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        geistSerif.variable,
        GeistSans.className
      )}
      lang="en"
      suppressHydrationWarning
    >
      <body className="relative flex min-h-screen flex-col">
        <SiteLeftDotGrid />
        {openPanelClientId ? (
          <OpenPanelComponent
            apiUrl="/api/op"
            clientId={openPanelClientId}
            scriptUrl="/api/op/op1.js"
            trackAttributes
            trackOutgoingLinks
            trackScreenViews
          />
        ) : null}
        <GithubStatsProvider>
          <RootProvider
            search={{
              SearchDialog: DocsSearchDialog,
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
            {children}
          </RootProvider>
        </GithubStatsProvider>
      </body>
    </html>
  );
}
