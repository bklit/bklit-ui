import type { ReactNode } from "react";
import {
  SiteEdgeLines,
  SiteHeaderRivets,
} from "@/components/design/site-chrome";
import { SiteFooter } from "@/components/docs/site-footer";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-1 flex-col overflow-clip">
      <SiteEdgeLines />
      <SiteHeaderRivets />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
