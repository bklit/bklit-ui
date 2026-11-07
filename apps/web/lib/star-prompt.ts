"use client";

import { useSyncExternalStore } from "react";

/**
 * "Star the repo" prompt state.
 *
 * - Dismissing the floating card sets a 14-day cookie. While it is set the
 *   floating card stays hidden and the docs sidebar shows a quieter version.
 * - Clicking "Star us" (in either place) sets a 30-day cookie that hides both.
 * - Pages seen this session live in sessionStorage, so the floating card only
 *   shows from the second distinct page onwards.
 */
export const STAR_PROMPT_DISMISSED_COOKIE = "bklit-star-prompt-dismissed";
export const STAR_PROMPT_STARRED_COOKIE = "bklit-star-prompt-starred";
const DAY = 60 * 60 * 24;
const PAGES_SEEN_KEY = "bklit-star-prompt-pages";

/** `open`: may float in · `dismissed`: sidebar only · `starred`: hidden everywhere. */
export type StarPromptStatus = "open" | "dismissed" | "starred";

const listeners = new Set<() => void>();

function hasCookie(name: string): boolean {
  return document.cookie
    .split("; ")
    .some((part) => part.startsWith(`${name}=`));
}

function readStatus(): StarPromptStatus {
  if (hasCookie(STAR_PROMPT_STARRED_COOKIE)) {
    return "starred";
  }
  return hasCookie(STAR_PROMPT_DISMISSED_COOKIE) ? "dismissed" : "open";
}

function setCookie(name: string, days: number) {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not in Safari < 18.4
  document.cookie = `${name}=1; path=/; max-age=${days * DAY}; SameSite=Lax`;
  for (const listener of listeners) {
    listener();
  }
}

export function dismissStarPrompt() {
  setCookie(STAR_PROMPT_DISMISSED_COOKIE, 14);
}

export function markStarPromptStarred() {
  setCookie(STAR_PROMPT_STARRED_COOKIE, 30);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** `null` until hydrated (the server can't see the cookies). */
export function useStarPromptStatus(): StarPromptStatus | null {
  return useSyncExternalStore(subscribe, readStatus, () => null);
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
