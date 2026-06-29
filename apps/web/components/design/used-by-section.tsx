import { UsedByLogoGrid } from "@/components/design/used-by-logo-grid";
import { cn } from "@/lib/utils";

export function UsedBySection({ className }: { className?: string }) {
  return (
    <section
      aria-label="Trusted by people at"
      className={cn(
        "container mx-auto px-4 py-10 text-left sm:py-16",
        className
      )}
    >
      <p className="mb-6 font-mono text-muted-foreground text-xs uppercase tracking-widest">
        Trusted by people at<span className="animate-caret-blink">_</span>
      </p>
      <UsedByLogoGrid />
    </section>
  );
}
