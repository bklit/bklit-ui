import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span className="font-semibold">
        bklit<span className="text-fd-primary">-ui</span>
      </span>
    ),
  },
  links: [
    {
      text: "Get Started",
      url: "/docs",
      active: "nested-url",
    },
    {
      text: "Components",
      url: "/docs/components",
      active: "nested-url",
    },
  ],
  githubUrl: "https://github.com/yourusername/bklit-ui",
};
