import { DesignHeroCanvas } from "@/components/design/design-hero-canvas";
import { HomeFooter } from "@/components/design/home-footer";
import { HomeHeroSection } from "@/components/design/home-hero-section";
import { HomeShowcaseSection } from "@/components/design/home-showcase-section";
import { HomeSponsorsSection } from "@/components/design/home-sponsors-section";
import { HomeTestimonialsSection } from "@/components/design/home-testimonials-section";
import { LineGrid } from "@/components/design/line-grid";
import {
  SiteDivider,
  siteContainerClassName,
} from "@/components/design/site-chrome";
import { UsedBySection } from "@/components/design/used-by-section";
import { Frame, FramePanel } from "@/components/ui/frame";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <HomeHeroSection>
        <div
          className={`${siteContainerClassName} pt-6 pb-8 md:pt-10 md:pb-12`}
        >
          <Frame className="after:pointer-events-none after:absolute after:-inset-[5px] after:-z-1 after:rounded-[calc(var(--radius-2xl)+5px)] after:border after:border-border/64">
            <FramePanel className="overflow-hidden p-0">
              <LineGrid
                className="aspect-3/2 [--grid-cell-height:calc(100%/2)] [--grid-cell-width:calc(100%/3)] md:aspect-4/2 lg:aspect-6/3 md:[--grid-cell-height:calc(100%/2)] md:[--grid-cell-width:calc(100%/4)] lg:[--grid-cell-height:calc(100%/3)] lg:[--grid-cell-width:calc(100%/6)]"
                columns={3}
                columnsLg={6}
                columnsMd={4}
                framed
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
            </FramePanel>
          </Frame>
        </div>
      </HomeHeroSection>
      <SiteDivider />
      <UsedBySection />
      <SiteDivider />
      <HomeShowcaseSection />
      <HomeTestimonialsSection />
      <HomeSponsorsSection />
      <HomeFooter />
    </main>
  );
}
