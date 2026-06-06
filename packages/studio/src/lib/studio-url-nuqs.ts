import {
  hasCompressedStudioParam,
  STUDIO_URL_CODEC_VERSION,
  STUDIO_URL_PARAM,
} from "./studio-url-codec";

/** Keep only the compressed studio blob in the URL when present. */
export function processStudioUrlSearchParams(
  search: URLSearchParams
): URLSearchParams {
  const serialized = search.get(STUDIO_URL_PARAM);
  if (
    serialized?.startsWith(`${STUDIO_URL_CODEC_VERSION}.`) &&
    hasCompressedStudioParam(
      new URLSearchParams({ [STUDIO_URL_PARAM]: serialized })
    )
  ) {
    const next = new URLSearchParams();
    next.set(STUDIO_URL_PARAM, serialized);
    return next;
  }

  return search;
}
