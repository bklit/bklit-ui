import { DesignHeroCanvas } from "@/components/design/design-hero-canvas";
import { HomeFooter } from "@/components/design/home-footer";
import { HomeHeroSection } from "@/components/design/home-hero-section";
import { HomeShowcaseSection } from "@/components/design/home-showcase-section";
import { HomeSponsorsSection } from "@/components/design/home-sponsors-section";
import { HomeTestimonialsSection } from "@/components/design/home-testimonials-section";
import {
  SiteDivider,
  siteContainerClassName,
} from "@/components/design/site-chrome";
import { UsedBySection } from "@/components/design/used-by-section";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <HomeHeroSection>
        <div
          className={`${siteContainerClassName} pt-6 pb-8 md:pt-10 md:pb-12`}
        >
          <DesignHeroCanvas />
        </div>
      </HomeHeroSection>
      <SiteDivider />
      {/* 4 charts · trusted by · 4 more charts */}
      <HomeShowcaseSection className="pb-8 md:pb-12" rows={[0, 2]} />
      <SiteDivider />
      <UsedBySection />
      <SiteDivider />
      <HomeShowcaseSection rows={[2, 4]} />
      <HomeTestimonialsSection />
      <HomeSponsorsSection />
      <HomeFooter />
    </main>
  );
}
