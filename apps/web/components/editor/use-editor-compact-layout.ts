"use client";

import { useEffect, useState } from "react";

export const EDITOR_COMPACT_LAYOUT_QUERY = "(max-width: 767px)";

export function useEditorCompactLayout() {
  const [state, setState] = useState({ compact: false, ready: false });

  useEffect(() => {
    const query = window.matchMedia(EDITOR_COMPACT_LAYOUT_QUERY);
    const sync = () => setState({ compact: query.matches, ready: true });
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return state;
}
