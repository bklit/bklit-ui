import { GithubStatsProvider } from "@/components/providers/github-stats-provider";
import "./globals.css";
import { BklitComponent } from "@bklit/sdk/nextjs";
import { RootProvider } from "fumadocs-ui/provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const geistHeading = Geist({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
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
    url: "https://ui.bklit.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bklit UI - Charts & Data Visualization Components",
    description:
      "Bklit UI is a component library built on top of shadcn/ui to help you build charts and data visualizations more easily.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={cn(
        inter.variable,
        geistMono.variable,
        geistHeading.variable,
        "font-sans"
      )}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <BklitComponent
          apiKey={process.env.BKLIT_API_KEY ?? ""}
          projectId={process.env.BKLIT_PROJECT_ID ?? ""}
        />
        <GithubStatsProvider>
          <RootProvider
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
