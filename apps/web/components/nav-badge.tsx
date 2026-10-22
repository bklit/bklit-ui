import { Badge } from "@/components/ui/badge";
import type { NavBadgeKind } from "@/lib/nav-badges";
import { cn } from "@/lib/utils";

const navBadgeLabels: Record<NavBadgeKind, string> = {
  featured: "Featured",
  new: "New",
};

/** "New" / "Featured" marker for nav items — always the Badge `info` variant. */
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
    <Badge className={cn("shrink-0", className)} size="sm" variant="info">
      {navBadgeLabels[kind]}
    </Badge>
  );
}
