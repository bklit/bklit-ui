import type { ReactNode } from "react";
import { SiteShell } from "@/components/design/site-shell";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
