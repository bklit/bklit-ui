import type { ReactNode } from "react";
import { SiteFooter } from "@/components/docs/site-footer";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
