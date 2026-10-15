import { HomeShowcaseGrid } from "@/components/design/home-showcase-grid";
import { siteContainerClassName } from "@/components/design/site-chrome";
import { cn } from "@/lib/utils";

export function HomeShowcaseSection() {
  return (
    <section className="relative w-full">
      <div className={cn(siteContainerClassName, "pt-8 md:pt-12")}>
        <HomeShowcaseGrid />
      </div>
    </section>
  );
}
