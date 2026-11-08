"use client";

/** Cursor y published by `ChartCrosshair`, read by the matching `YAxis`. */
export interface CrosshairYState {
  /** Plot-relative y of the cursor. */
  y: number;
  /** Normalised `yAxisId` the value pill sits on. */
  axisId: string;
}

interface CrosshairStore {
  state: CrosshairYState | null;
  listeners: Set<() => void>;
}

// Keyed by chart container: `ChartCrosshair` and `YAxis` are siblings with no
// shared provider, but both portal into the same container element.
const stores = new WeakMap<HTMLElement, CrosshairStore>();

function getStore(container: HTMLElement): CrosshairStore {
  let store = stores.get(container);
  if (!store) {
    store = { state: null, listeners: new Set() };
    stores.set(container, store);
  }
  return store;
}

export function setCrosshairY(
  container: HTMLElement,
  state: CrosshairYState | null
) {
  const store = getStore(container);
  const prev = store.state;
  if (
    prev === state ||
    (prev && state && prev.y === state.y && prev.axisId === state.axisId)
  ) {
    return;
  }
  store.state = state;
  for (const listener of store.listeners) {
    listener();
  }
}

/**
 * Listen to crosshair moves without React: the listener runs synchronously in
 * the pointer handler, so write to the DOM there instead of setting state.
 * Called once on subscribe with the current state.
 */
export function subscribeCrosshair(
  container: HTMLElement,
  listener: (state: CrosshairYState | null) => void
): () => void {
  const store = getStore(container);
  const notify = () => listener(store.state);
  store.listeners.add(notify);
  notify();
  return () => {
    store.listeners.delete(notify);
  };
}

/** Fade zone (px) beyond the pill edge — matches the x-axis date ticker. */
const TICK_FADE_BUFFER = 20;

/**
 * Tick label opacity under the crosshair value pill: hidden beneath it,
 * fading back in over {@link TICK_FADE_BUFFER} px — the y-axis twin of the
 * x-axis date-ticker fade.
 */
export function crosshairTickOpacity(
  state: CrosshairYState | null,
  axisId: string,
  tickY: number,
  pillHalfHeight: number
): number {
  if (!state || state.axisId !== axisId) {
    return 1;
  }
  const distance = Math.abs(tickY - state.y);
  if (distance < pillHalfHeight) {
    return 0;
  }
  if (distance < pillHalfHeight + TICK_FADE_BUFFER) {
    return (distance - pillHalfHeight) / TICK_FADE_BUFFER;
  }
  return 1;
}
