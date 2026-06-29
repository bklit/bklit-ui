"use client";

import { useEffect, useState } from "react";

export const EDITOR_COMPACT_LAYOUT_QUERY = "(max-width: 767px)";

function readCompactLayout() {
  if (typeof window === "undefined") {
    return { compact: false, ready: false };
  }

  return {
    compact: window.matchMedia(EDITOR_COMPACT_LAYOUT_QUERY).matches,
    ready: true,
  };
}

export function useEditorCompactLayout() {
  const [state, setState] = useState(readCompactLayout);

  useEffect(() => {
    const query = window.matchMedia(EDITOR_COMPACT_LAYOUT_QUERY);
    const sync = () => setState({ compact: query.matches, ready: true });
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return state;
}
