/**
 * Update the address bar without it counting as a navigation — e.g. the
 * changelog syncing the URL to the entry being read. Next.js picks up
 * `history.replaceState` (usePathname changes), so `ScrollToTopOnNavigate`
 * checks `isQuietUrl` to skip its scroll reset for these updates.
 */
/** Pathname → when it was set. Marks expire so real navigations still count. */
const quietPathnames = new Map<string, number>();
const QUIET_WINDOW_MS = 1000;

export function replaceUrlQuietly(url: string) {
  if (url === window.location.pathname) {
    return;
  }
  // Several replacements can land before React commits (fast scrolling), so
  // each one is marked rather than only the latest.
  quietPathnames.set(url, performance.now());
  window.history.replaceState(null, "", url);
}

/** True when `pathname` was just set by `replaceUrlQuietly`. */
export function isQuietUrl(pathname: string | null): boolean {
  const now = performance.now();
  for (const [url, time] of quietPathnames) {
    if (now - time > QUIET_WINDOW_MS) {
      quietPathnames.delete(url);
    }
  }
  return pathname !== null && quietPathnames.has(pathname);
}
