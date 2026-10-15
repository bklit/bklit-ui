import { HomeTestimonialsGrid } from "@/components/design/home-testimonials-grid";
import { DesignSectionHeader } from "@/components/design/section-header";
import { siteContainerClassName } from "@/components/design/site-chrome";
import { cn } from "@/lib/utils";

export function HomeTestimonialsSection() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative w-full pt-16 md:pt-24"
    >
      <div className={cn(siteContainerClassName)}>
        <DesignSectionHeader
          subtitle="What people are saying"
          title="Feel the love"
          titleId="testimonials-heading"
        />
        <HomeTestimonialsGrid />
      </div>
    </section>
  );
}
