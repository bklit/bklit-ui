import { DesignHeroCanvas } from "@/components/design/design-hero-canvas";
import { HomeFooter } from "@/components/design/home-footer";
import { HomeHeroSection } from "@/components/design/home-hero-section";
import { HomeShowcaseSection } from "@/components/design/home-showcase-section";
import { HomeSponsorsSection } from "@/components/design/home-sponsors-section";
// import { HomeStudioSection } from "@/components/design/home-studio-section";
import { HomeTestimonialsSection } from "@/components/design/home-testimonials-section";
import { LineGrid } from "@/components/design/line-grid";
import { UsedBySection } from "@/components/design/used-by-section";

export const DesignHero = () => {
  return (
    <>
      <HomeHeroSection>
        <div className="container mx-auto w-full overflow-visible pt-8 md:pt-16">
          <LineGrid
            className="aspect-3/2 [--grid-cell-height:calc(100%/2)] [--grid-cell-width:calc(100%/3)] md:aspect-4/2 lg:aspect-6/3 md:[--grid-cell-height:calc(100%/2)] md:[--grid-cell-width:calc(100%/4)] lg:[--grid-cell-height:calc(100%/3)] lg:[--grid-cell-width:calc(100%/6)]"
            columns={3}
            columnsLg={6}
            columnsMd={4}
            pulse
            pulseMaxActive={2}
            pulseMaxActiveLg={6}
            pulseMaxActiveMd={4}
            pulseMinActive={1}
            pulseMinActiveLg={3}
            pulseMinActiveMd={2}
            rows={2}
            rowsLg={3}
            rowsMd={2}
            variant="solid"
          >
            <DesignHeroCanvas />
          </LineGrid>
        </div>
      </HomeHeroSection>
      <UsedBySection />
      <HomeShowcaseSection />
      <HomeTestimonialsSection />
      {/* <HomeStudioSection /> */}
      <HomeSponsorsSection />
      <HomeFooter />
    </>
  );
};
