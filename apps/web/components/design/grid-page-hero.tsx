import type { ReactNode } from "react";
import { SitePageHeader } from "@/components/design/site-chrome";

/** Sub-page hero (Blocks, Showcase) — coss-style left-aligned page header. */
export function GridPageHero({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <SitePageHeader
      actions={action}
      description={`${subtitle}.`}
      title={title}
    />
  );
}
