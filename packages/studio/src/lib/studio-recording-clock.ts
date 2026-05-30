export interface RecordingPauseState {
  pauseStartedAt: number | null;
  accumulatedPauseMs: number;
}

export function createRecordingPauseState(): RecordingPauseState {
  return { pauseStartedAt: null, accumulatedPauseMs: 0 };
}

/** Elapsed recording time; freezes while `isPaused` is true. */
export function getRecordingElapsedMs(
  startTime: number,
  isPaused: () => boolean,
  state: RecordingPauseState
): number {
  const now = performance.now();

  if (isPaused()) {
    if (state.pauseStartedAt === null) {
      state.pauseStartedAt = now;
    }
    const activePauseMs = now - state.pauseStartedAt;
    return now - startTime - state.accumulatedPauseMs - activePauseMs;
  }

  if (state.pauseStartedAt !== null) {
    state.accumulatedPauseMs += now - state.pauseStartedAt;
    state.pauseStartedAt = null;
  }

  return now - startTime - state.accumulatedPauseMs;
}
