/** Repo-root-relative path, e.g. `packages/studio/src/ui/button.tsx` */
export type RepoRelativePath = string;

const TRAILING_SLASH_RE = /\/$/;
const LEADING_SLASH_RE = /^\//;

function workspaceRoot(): string | null {
  const root = process.env.NEXT_PUBLIC_WORKSPACE_ROOT?.trim();
  return root ? root.replace(TRAILING_SLASH_RE, "") : null;
}

/** Absolute path on disk for a repo-relative studio/ui file. */
export function toAbsoluteRepoPath(
  relativePath: RepoRelativePath
): string | null {
  const root = workspaceRoot();
  if (!root) {
    return null;
  }
  return `${root}/${relativePath.replace(LEADING_SLASH_RE, "")}`;
}

/**
 * Deep link that opens a file in Cursor.
 * @see https://forum.cursor.com/t/open-in-cursor-url-handler/1999
 */
export function toCursorFileUrl(relativePath: RepoRelativePath): string | null {
  const absolute = toAbsoluteRepoPath(relativePath);
  if (!absolute) {
    return null;
  }
  return `cursor://file${absolute}`;
}

export function fileBaseName(relativePath: RepoRelativePath): string {
  return relativePath.split("/").pop() ?? relativePath;
}

export function openInCursor(relativePath: RepoRelativePath): boolean {
  const url = toCursorFileUrl(relativePath);
  if (!url) {
    return false;
  }
  window.location.assign(url);
  return true;
}
