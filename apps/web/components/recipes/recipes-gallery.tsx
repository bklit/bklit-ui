"use client";

import { recipeCategories, recipes } from "./definitions";
import { RecipeViewer } from "./recipe-viewer";

const sections = recipeCategories
  .map((category) => ({
    ...category,
    recipes: recipes.filter((recipe) => recipe.category === category.id),
  }))
  .filter((section) => section.recipes.length > 0);

export function RecipesGallery() {
  return (
    <div className="flex w-full flex-col gap-10 md:gap-14">
      <nav aria-label="Recipe sections">
        <ul className="flex flex-wrap gap-1.5">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-foreground"
                href={`#section-${section.id}`}
              >
                {section.title}
                <span className="text-muted-foreground/70 tabular-nums">
                  {section.recipes.length}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {sections.map((section) => (
        <section
          aria-labelledby={`section-${section.id}-title`}
          className="flex scroll-mt-[calc(var(--site-header-height)+1rem)] flex-col gap-8 md:gap-10"
          data-recipe-section={section.id}
          id={`section-${section.id}`}
          key={section.id}
        >
          <header className="flex flex-col gap-1 border-border border-b px-1 pb-3">
            <h2
              className="font-heading font-semibold text-2xl text-foreground tracking-tight"
              id={`section-${section.id}-title`}
            >
              {section.title}
            </h2>
            <p className="text-muted-foreground text-sm">
              {section.description}
            </p>
          </header>
          <div className="flex flex-col gap-12 md:gap-16">
            {section.recipes.map((recipe) => (
              <RecipeViewer key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
