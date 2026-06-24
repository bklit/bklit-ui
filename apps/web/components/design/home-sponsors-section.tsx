import { HomeSponsorsGrid } from "@/components/design/home-sponsors-grid";
import { DesignSectionHeader } from "@/components/design/section-header";

export function HomeSponsorsSection() {
  return (
    <section
      aria-labelledby="sponsors-heading"
      className="relative w-full pt-12 md:pt-24"
    >
      <div className="container mx-auto w-full overflow-visible">
        <DesignSectionHeader
          className="pb-6"
          subtitle="Thank you for believing in what we're building"
          title="Our sponsors"
          titleId="sponsors-heading"
        />
        <HomeSponsorsGrid />
      </div>
    </section>
  );
}
