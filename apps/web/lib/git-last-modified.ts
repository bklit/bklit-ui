import { execFileSync } from "node:child_process";

const cache = new Map<string, Date | undefined>();

/**
 * Date of the most recent commit touching any of `paths` (relative to
 * `apps/web`). Returns `undefined` when git or history is unavailable so the
 * sitemap omits `lastmod` instead of reporting the build time.
 */
export function gitLastModified(paths: string[]): Date | undefined {
  const key = paths.join("\0");
  if (cache.has(key)) {
    return cache.get(key);
  }

  let result: Date | undefined;
  try {
    const output = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", ...paths],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }
    ).trim();
    result = output ? new Date(output) : undefined;
  } catch {
    result = undefined;
  }

  cache.set(key, result);
  return result;
}

export function latestDate(...dates: (Date | undefined)[]): Date | undefined {
  let latest: Date | undefined;
  for (const date of dates) {
    if (date && (!latest || date > latest)) {
      latest = date;
    }
  }
  return latest;
}
