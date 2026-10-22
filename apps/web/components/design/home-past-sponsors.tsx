import Link from "fumadocs-core/link";
import { pastSponsors } from "@/lib/sponsors";

export function HomePastSponsors() {
  if (pastSponsors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-8 pb-2">
      <p className="text-muted-foreground text-sm">Past sponsors</p>
      <nav
        aria-label="Past sponsors"
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
      >
        {pastSponsors.map((sponsor) => (
          <Link
            className="font-medium text-muted-foreground text-sm no-underline transition-colors hover:text-foreground"
            external
            href={sponsor.href}
            key={sponsor.id}
          >
            {sponsor.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
