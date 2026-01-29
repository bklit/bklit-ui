import { GithubStatsProvider } from "@/components/providers/github-stats-provider";
import "./globals.css";
import { BklitComponent } from "@bklit/sdk/nextjs";
import { RootProvider } from "fumadocs-ui/provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "bklit-ui",
    template: "%s | bklit-ui",
  },
  description: "Beautiful UI components for React",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${geist.variable} ${geistMono.variable}`}
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
