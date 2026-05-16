import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/docs/site-footer";
import { SiteHeader } from "@/components/docs/site-header";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Interactive chart studio — explore every Bklit chart and tune props in real time.",
};

const studioNavLinks = [
  { text: "Docs", url: "/docs" },
  { text: "Charts", url: "/charts" },
  { text: "Studio", url: "/studio" },
];

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        discordUrl="https://discord.com/invite/9yyK8FwPcU"
        githubUrl="https://github.com/bklit/bklit-ui"
        links={studioNavLinks}
      />
      <main className="flex min-h-0 flex-1 flex-col pt-14">
        <NuqsAdapter>{children}</NuqsAdapter>
      </main>
      <SiteFooter />
    </div>
  );
}
