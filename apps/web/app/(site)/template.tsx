import type { ReactNode } from "react";
import { SitePageTransition } from "@/components/docs/site-page-transition";

export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <SitePageTransition>{children}</SitePageTransition>;
}
