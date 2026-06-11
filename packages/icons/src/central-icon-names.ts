import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

let cachedNames: string[] | null = null;

/** All Central Icon System names from `@central-icons-react/all`. */
export function getCentralIconNames(): string[] {
  if (cachedNames) {
    return cachedNames;
  }

  const pkgPath = require.resolve("@central-icons-react/all/package.json");
  const iconIndexPath = join(dirname(pkgPath), "icons/index.d.ts");
  const content = readFileSync(iconIndexPath, "utf8");
  cachedNames = [...content.matchAll(/readonly (Icon[A-Za-z0-9]+):/g)]
    .map((match) => match[1])
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b));

  return cachedNames;
}
