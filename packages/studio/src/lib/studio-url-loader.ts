import { createLoader } from "nuqs/server";
import { type StudioUrlState, studioSearchParams } from "./studio-parsers";
import {
  decodeStudioUrlState,
  encodeStudioUrlState,
  hasCompressedStudioParam,
  STUDIO_URL_PARAM,
} from "./studio-url-codec";

export const loadStudioSearchParams = createLoader(studioSearchParams);

/** Parse studio state from a URL (compressed `s` param takes priority over flat params). */
export function loadStudioStateFromRequest(url: URL): StudioUrlState {
  if (hasCompressedStudioParam(url.searchParams)) {
    const serialized = url.searchParams.get(STUDIO_URL_PARAM);
    if (serialized) {
      return decodeStudioUrlState(serialized);
    }
  }

  return loadStudioSearchParams(url.searchParams) as StudioUrlState;
}

/** Canonical compressed `s` value for metadata / share links. */
export function studioSerializedParam(state: StudioUrlState): string {
  return encodeStudioUrlState(state);
}
