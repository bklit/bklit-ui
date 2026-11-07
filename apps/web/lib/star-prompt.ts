"use client";

import { useSyncExternalStore } from "react";

/**
 * "Star the repo" prompt state.
 *
 * - Dismissal lives in a cookie for 14 days. While it is set the floating card
 *   stays hidden and the docs sidebar shows a quieter version instead.
 * - Pages seen this session live in sessionStorage, so the floating card only
 *   shows from the second distinct page onwards.
 */
export const STAR_PROMPT_COOKIE_NAME = "bklit-star-prompt-dismissed";
export const STAR_PROMPT_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;
const PAGES_SEEN_KEY = "bklit-star-prompt-pages";

const listeners = new Set<() => void>();

function readDismissed(): boolean {
  return document.cookie
    .split("; ")
    .some((part) => part.startsWith(`${STAR_PROMPT_COOKIE_NAME}=`));
}

export function dismissStarPrompt() {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not in Safari < 18.4
  document.cookie = `${STAR_PROMPT_COOKIE_NAME}=1; path=/; max-age=${STAR_PROMPT_COOKIE_MAX_AGE}; SameSite=Lax`;
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * `null` until hydrated (the server can't see the cookie), then whether the
 * prompt has been dismissed in the last 14 days.
 */
export function useStarPromptDismissed(): boolean | null {
  return useSyncExternalStore(subscribe, readDismissed, () => null);
}

/** Records `pathname` as seen and returns how many distinct pages this session. */
export function recordPageSeen(pathname: string): number {
  try {
    const raw = sessionStorage.getItem(PAGES_SEEN_KEY);
    const seen = new Set<string>(raw ? JSON.parse(raw) : []);
    seen.add(pathname);
    sessionStorage.setItem(PAGES_SEEN_KEY, JSON.stringify([...seen]));
    return seen.size;
  } catch {
    // Storage blocked (private mode, embedded iframe): never nag.
    return 0;
  }
}
