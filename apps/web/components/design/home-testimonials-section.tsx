import { HomeTestimonialsGrid } from "@/components/design/home-testimonials-grid";
import { DesignSectionHeader } from "@/components/design/section-header";

export function HomeTestimonialsSection() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative w-full pt-12 md:pt-24"
    >
      <div className="container mx-auto w-full overflow-visible">
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
