import { readFileSync } from "node:fs";
import { join } from "node:path";

let cachedNames: string[] | null = null;

/** All Central Icon System names from `@central-icons-react/all`. */
export function getCentralIconNames(): string[] {
  if (cachedNames) {
    return cachedNames;
  }

  const iconIndexPath = join(
    process.cwd(),
    "node_modules/@central-icons-react/all/icons/index.d.ts"
  );
  const content = readFileSync(iconIndexPath, "utf8");
  cachedNames = [...content.matchAll(/readonly (Icon[A-Za-z0-9]+):/g)]
    .map((match) => match[1])
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b));

  return cachedNames;
}
