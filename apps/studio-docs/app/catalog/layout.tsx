import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

export default function CatalogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="pt-14">{children}</main>
    </>
  );
}
