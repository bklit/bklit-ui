import type { Metadata } from "next";
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
import { JsonLd } from "@/components/seo/json-ld";
import {
  absoluteUrl,
  GITHUB_URL,
  homeOgImages,
  pageMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = pageMetadata({
  title: SITE_TITLE,
  absoluteTitle: true,
  description: SITE_DESCRIPTION,
  path: "/",
  images: homeOgImages(),
});

const homeJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    codeRepository: GITHUB_URL,
    programmingLanguage: ["TypeScript", "React"],
    runtimePlatform: "React",
    license: "https://opensource.org/licenses/MIT",
    isAccessibleForFree: true,
    image: absoluteUrl("/opengraph-image.png"),
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={homeJsonLd} />
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
