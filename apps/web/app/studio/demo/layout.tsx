import type { ReactNode } from "react";
import { themeInitScript } from "@/lib/theme-init-script";

export default function StudioDemoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: theme bootstrap before hydration
        dangerouslySetInnerHTML={{ __html: themeInitScript }}
        id="studio-demo-theme"
      />
      {children}
    </>
  );
}
