"use client";

import { defaultStudioState, type StudioUrlState } from "@bklitui/studio";
import { useCallback, useMemo, useState } from "react";

export function usePlaygroundState(initialState: Partial<StudioUrlState> = {}) {
  const [state, setState] = useState(() => defaultStudioState(initialState));
  const [previewOverrides, setPreviewOverrides] = useState<
    Partial<StudioUrlState>
  >({});
  const [motionCurveDragging, setMotionCurveDragging] = useState(false);

  const displayState = useMemo(
    (): StudioUrlState => ({
      ...state,
      ...previewOverrides,
    }),
    [previewOverrides, state]
  );

  const setParam = useCallback(
    <K extends keyof StudioUrlState>(key: K, value: StudioUrlState[K]) => {
      setPreviewOverrides((prev) => {
        if (!(key in prev)) {
          return prev;
        }
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const setPreviewParam = useCallback(
    <K extends keyof StudioUrlState>(key: K, value: StudioUrlState[K]) => {
      setPreviewOverrides((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const commitParam = useCallback(
    <K extends keyof StudioUrlState>(key: K, value: StudioUrlState[K]) => {
      setPreviewOverrides((prev) => {
        if (!(key in prev)) {
          return prev;
        }
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return {
    state,
    displayState,
    setParam,
    setPreviewParam,
    commitParam,
    motionCurveDragging,
    setMotionCurveDragging,
  };
}

export type PlaygroundState = ReturnType<typeof usePlaygroundState>;
