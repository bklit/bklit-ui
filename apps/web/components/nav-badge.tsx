import { Badge } from "@/components/ui/badge";
import type { NavBadgeKind } from "@/lib/nav-badges";
import { cn } from "@/lib/utils";

const navBadgeLabels: Record<NavBadgeKind, string> = {
  beta: "Beta",
  featured: "Featured",
  new: "New",
};

/** Beta is orange; New / Featured use the Badge `info` variant. */
const BETA_CLASS =
  "bg-orange-500/10 text-orange-700 dark:bg-orange-500/16 dark:text-orange-400";

/** "New" / "Featured" / "Beta" marker for nav items. */
export function NavBadge({
  kind,
  className,
}: {
  kind: NavBadgeKind | undefined;
  className?: string;
}) {
  if (!kind) {
    return null;
  }

  return (
    <Badge
      className={cn("shrink-0", kind === "beta" && BETA_CLASS, className)}
      size="sm"
      variant="info"
    >
      {navBadgeLabels[kind]}
    </Badge>
  );
}
