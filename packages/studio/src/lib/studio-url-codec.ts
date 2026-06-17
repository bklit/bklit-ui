import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { coerceStudioUrlState } from "./coerce-studio-url-state";
import { defaultStudioState, type StudioUrlState } from "./studio-parsers";
import {
  STUDIO_STATE_KEY_ORDER,
  STUDIO_V1_DECODE_KEY_ORDERS,
} from "./studio-url-key-orders";

export const STUDIO_URL_PARAM = "s";
export const STUDIO_URL_CODEC_VERSION = "v1";

type DeltaEntry = [number, string | number | boolean];
type DeltaPayload = DeltaEntry[];

type KeyOrder = readonly (keyof StudioUrlState)[];

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

function applyDelta(delta: DeltaPayload, keyOrder: KeyOrder): StudioUrlState {
  const result = defaultStudioState();

  for (const [index, value] of delta) {
    const key = keyOrder[index];
    if (!key || value === null || value === undefined) {
      continue;
    }
    (result as unknown as Record<string, unknown>)[key] = value;
  }

  return result;
}

/**
 * Count delta entries whose value type disagrees with the field's default type
 * under a given key layout. The correct historical layout yields zero — old `v1`
 * blobs were encoded against several layouts that drifted without a version bump.
 */
function countTypeMismatches(delta: DeltaPayload, keyOrder: KeyOrder): number {
  const defaults = defaultStudioState();
  let mismatches = 0;

  for (const [index, value] of delta) {
    const key = keyOrder[index];
    if (!key) {
      mismatches++;
      continue;
    }
    if (typeof value !== typeof defaults[key]) {
      mismatches++;
    }
  }

  return mismatches;
}

/** Pick the historical key layout that best fits the delta, then coerce types. */
function decodeDelta(delta: DeltaPayload): StudioUrlState {
  let bestOrder: KeyOrder = STUDIO_STATE_KEY_ORDER;
  let bestMismatches = Number.POSITIVE_INFINITY;

  for (const keyOrder of STUDIO_V1_DECODE_KEY_ORDERS) {
    const mismatches = countTypeMismatches(delta, keyOrder);
    if (mismatches < bestMismatches) {
      bestMismatches = mismatches;
      bestOrder = keyOrder;
      if (mismatches === 0) {
        break;
      }
    }
  }

  return coerceStudioUrlState(applyDelta(delta, bestOrder));
}

/** Delta-encode studio state and compress into a URL-safe `v1.*` blob. */
export function encodeStudioUrlState(state: StudioUrlState): string {
  const json = JSON.stringify(buildDelta(state));
  const compressed = compressToEncodedURIComponent(json);
  return `${STUDIO_URL_CODEC_VERSION}.${compressed}`;
}

/** Decode a `v1.*` blob into full studio state (defaults merged, types coerced). */
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
    return decodeDelta(delta);
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
