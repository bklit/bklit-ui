import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import {
  defaultStudioState,
  type StudioUrlState,
  studioSearchParams,
} from "./studio-parsers";

export const STUDIO_URL_PARAM = "s";
export const STUDIO_URL_CODEC_VERSION = "v1";

/** Stable key order — append-only when adding params (bump codec version if reordering). */
export const STUDIO_STATE_KEY_ORDER = Object.keys(
  studioSearchParams
) as (keyof StudioUrlState)[];

type DeltaEntry = [number, string | number | boolean];
type DeltaPayload = DeltaEntry[];

function buildDelta(state: StudioUrlState): DeltaPayload {
  const defaults = defaultStudioState();
  const delta: DeltaPayload = [];

  for (let index = 0; index < STUDIO_STATE_KEY_ORDER.length; index++) {
    const key = STUDIO_STATE_KEY_ORDER[index];
    if (!key) {
      continue;
    }
    const value = state[key];
    if (value === null || value === undefined) {
      continue;
    }
    if (value !== defaults[key]) {
      delta.push([index, value]);
    }
  }

  return delta;
}

function applyDelta(delta: DeltaPayload): StudioUrlState {
  const result = defaultStudioState();

  for (const [index, value] of delta) {
    const key = STUDIO_STATE_KEY_ORDER[index];
    if (!key || value === null || value === undefined) {
      continue;
    }
    (result as unknown as Record<string, unknown>)[key] = value;
  }

  return result;
}

/** Delta-encode studio state and compress into a URL-safe `v1.*` blob. */
export function encodeStudioUrlState(state: StudioUrlState): string {
  const json = JSON.stringify(buildDelta(state));
  const compressed = compressToEncodedURIComponent(json);
  return `${STUDIO_URL_CODEC_VERSION}.${compressed}`;
}

/** Decode a `v1.*` blob into full studio state (defaults merged). */
export function decodeStudioUrlState(serialized: string): StudioUrlState {
  if (!serialized.startsWith(`${STUDIO_URL_CODEC_VERSION}.`)) {
    return defaultStudioState();
  }

  const payload = serialized.slice(STUDIO_URL_CODEC_VERSION.length + 1);
  const json = decompressFromEncodedURIComponent(payload);
  if (!json) {
    return defaultStudioState();
  }

  try {
    const delta = JSON.parse(json) as DeltaPayload;
    if (!Array.isArray(delta)) {
      return defaultStudioState();
    }
    return applyDelta(delta);
  } catch {
    return defaultStudioState();
  }
}

/** True when the search string uses the compressed blob param. */
export function hasCompressedStudioParam(
  searchParams: URLSearchParams
): boolean {
  const value = searchParams.get(STUDIO_URL_PARAM);
  return Boolean(
    value?.startsWith(`${STUDIO_URL_CODEC_VERSION}.`) &&
      value.length > STUDIO_URL_CODEC_VERSION.length + 1
  );
}

/** True when any flat studio param (other than `s`) is present. */
export function hasLegacyStudioParams(searchParams: URLSearchParams): boolean {
  for (const key of STUDIO_STATE_KEY_ORDER) {
    if (searchParams.has(key)) {
      return true;
    }
  }
  return false;
}

/** Build `/studio?s=…` query string (leading `?` included). */
export function studioCompressedSearch(state: StudioUrlState): string {
  const encoded = encodeURIComponent(encodeStudioUrlState(state));
  return `?${STUDIO_URL_PARAM}=${encoded}`;
}

/** Relative Studio href — safe for SSR (no `window.location.origin`). */
export function studioRelativeStateHref(state: StudioUrlState): string {
  return `/studio${studioCompressedSearch(state)}`;
}
