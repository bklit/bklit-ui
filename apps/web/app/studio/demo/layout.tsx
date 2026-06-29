import Script from "next/script";
import type { ReactNode } from "react";
import { themeInitScript } from "@/lib/theme-init-script";

export default function StudioDemoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Script id="studio-demo-theme" strategy="beforeInteractive">
        {themeInitScript}
      </Script>
      {children}
    </>
  );
}
