import { ShowcaseCard } from "@/components/showcase/showcase-card";
import { ShowcaseSubmitCard } from "@/components/showcase/showcase-submit-card";
import { showcaseProjects } from "@/lib/showcase/projects";

export function ShowcaseGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {showcaseProjects.map((project) => (
        <ShowcaseCard key={project.url} project={project} />
      ))}
      <ShowcaseSubmitCard />
    </div>
  );
}
