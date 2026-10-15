import { siteContainerClassName } from "@/components/design/site-chrome";
import { UsedByLogoGrid } from "@/components/design/used-by-logo-grid";
import { cn } from "@/lib/utils";

export function UsedBySection({ className }: { className?: string }) {
  return (
    <section
      aria-label="Trusted by people at"
      className={cn(
        siteContainerClassName,
        "py-8 text-left sm:py-12",
        className
      )}
    >
      <p className="mb-6 text-muted-foreground text-sm">Trusted by people at</p>
      <UsedByLogoGrid />
    </section>
  );
}
