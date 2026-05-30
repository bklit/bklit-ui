"use client";

import { useEffect, useState } from "react";
import { motionSliceFromState } from "@/lib/chart-animation";
import { motionSignature } from "@/lib/motion-config";
import type { StudioUrlState } from "@/lib/studio-parsers";

/** Debounced remount key so enter animations replay after motion edits (gauge pattern). */
export function useStudioMotionRemountKey(state: StudioUrlState): string {
  const sig = motionSignature(motionSliceFromState(state));
  const [key, setKey] = useState(sig);

  useEffect(() => {
    const timer = window.setTimeout(() => setKey(sig), 280);
    return () => window.clearTimeout(timer);
  }, [sig]);

  return key;
}
