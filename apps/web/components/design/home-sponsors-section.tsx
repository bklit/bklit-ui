import { HomePastSponsors } from "@/components/design/home-past-sponsors";
import { HomeSponsorsGrid } from "@/components/design/home-sponsors-grid";
import { DesignSectionHeader } from "@/components/design/section-header";
import { siteContainerClassName } from "@/components/design/site-chrome";

export function HomeSponsorsSection() {
  return (
    <section
      aria-labelledby="sponsors-heading"
      className="relative w-full pt-16 md:pt-24"
    >
      <div className={siteContainerClassName}>
        <DesignSectionHeader
          subtitle="Thank you for believing in what we're building"
          title="Our sponsors"
          titleId="sponsors-heading"
        />
        <HomeSponsorsGrid />
        <HomePastSponsors />
      </div>
    </section>
  );
}
