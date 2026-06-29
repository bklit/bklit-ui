import type { RepoRelativePath } from "@/lib/open-in-cursor";

export interface CatalogSourceGroup {
  label: string;
  sources: RepoRelativePath[];
}

const GROUP_RULES: { label: string; match: (path: string) => boolean }[] = [
  { label: "Editor", match: (path) => path.includes("/editor/") },
  {
    label: "Controls",
    match: (path) => path.includes("/components/controls/"),
  },
  {
    label: "Components",
    match: (path) => path.includes("/components/"),
  },
  {
    label: "Color picker",
    match: (path) => path.includes("/ui/color-picker/"),
  },
  { label: "UI", match: (path) => path.includes("/ui/") },
  { label: "Shared UI", match: (path) => path.startsWith("packages/ui/") },
];

function groupLabelFor(path: RepoRelativePath): string {
  return GROUP_RULES.find((rule) => rule.match(path))?.label ?? "Other";
}

/** Group catalog tile sources by repo area (controls, ui, editor, …). */
export function groupCatalogSources(
  sources: RepoRelativePath[]
): CatalogSourceGroup[] {
  const grouped = new Map<string, RepoRelativePath[]>();
  const order: string[] = [];

  for (const source of sources) {
    const label = groupLabelFor(source);
    if (!grouped.has(label)) {
      grouped.set(label, []);
      order.push(label);
    }
    grouped.get(label)?.push(source);
  }

  return order.map((label) => ({
    label,
    sources: grouped.get(label) ?? [],
  }));
}

/** Parent folder hint for menu items, e.g. `controls/`. */
export function sourceFolderHint(relativePath: RepoRelativePath): string {
  const parts = relativePath.split("/");
  parts.pop();
  const parent = parts.pop();
  return parent ? `${parent}/` : "";
}
