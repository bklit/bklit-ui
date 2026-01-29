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
          apiKey="bk_live_1ad0d301f2271881c125737adc047fb190a44de59e82665d2c785d544e902c47"
          projectId="cmkza0j3b0001zsfhe1ee4b1e"
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
