import { HomeStudioPreview } from "@/components/design/home-studio-preview";
import { DesignSectionHeader } from "@/components/design/section-header";

export function HomeStudioSection() {
  return (
    <section
      aria-labelledby="studio-heading"
      className="relative hidden w-full pt-12 lg:block lg:pt-24"
    >
      <div className="container mx-auto w-full overflow-visible">
        <DesignSectionHeader
          className="pb-6"
          subtitle="Make it your own"
          title="Studio"
          titleId="studio-heading"
        />
        <HomeStudioPreview />
      </div>
    </section>
  );
}
