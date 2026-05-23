import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { BlockFile } from "./types";

const BLOCKS_ROOT = path.join(process.cwd(), "blocks");

export function readBlockFiles(
  slug: string,
  installPaths: readonly string[]
): BlockFile[] {
  const filesRoot = path.join(BLOCKS_ROOT, slug, "files");

  return installPaths.map((installPath) => ({
    path: installPath,
    content: fs.readFileSync(path.join(filesRoot, installPath), "utf-8"),
    language: installPath.endsWith(".json") ? "json" : "tsx",
  }));
}
