/** Append a cache-busting `v` query param (OG routes send `immutable`). */
export function withVersion(url: string, version: string): string {
  if (!version) {
    return url;
  }
  return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
}
