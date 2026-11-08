"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";

/**
 * Internal plumbing for live data editing (the bklit.com "Present chart"
 * dialog). A chart root calls `useChartDataOverride` with its data props;
 * without a `ChartDataOverrideProvider` above it the props come back untouched
 * (one context read, no state, no effects). Inside a provider the chart
 * registers its data (as a JSON-friendly "view") in mount order and renders
 * edited views pushed by the host. Not part of the public chart API.
 */

/** Maps a chart's data props to a JSON-friendly view and back. */
export interface ChartDataOverrideCodec<T extends object> {
  toView: (inputs: T) => unknown;
  fromView: (view: unknown, inputs: T) => T;
}

/** A registered chart, in mount order. */
export interface ChartDataSlot {
  id: string;
  component: string;
  /** The chart's own (unedited) data, as its codec's view. */
  view: unknown;
}

interface Registration {
  component: string;
  inputs: object | undefined;
  codec: ChartDataOverrideCodec<object> | undefined;
  view: unknown;
}

export interface ChartDataOverrideStore {
  /** Registered charts in mount order (stable until something changes). */
  getSlots: () => readonly ChartDataSlot[];
  subscribeSlots: (listener: () => void) => () => void;
  /**
   * Edited views by slot ordinal (`undefined` keeps that chart's own data);
   * `null` clears every override.
   */
  setOverrides: (views: readonly unknown[] | null) => void;
  getOverride: (id: string) => unknown;
  subscribeOverrides: (listener: () => void) => () => void;
  register: (id: string, component: string) => () => void;
  update: (
    id: string,
    inputs: object,
    codec: ChartDataOverrideCodec<object> | undefined
  ) => void;
}

function shallowEqual(a: object | undefined, b: object) {
  if (!a) {
    return false;
  }
  const aRecord = a as Record<string, unknown>;
  const bRecord = b as Record<string, unknown>;
  const aKeys = Object.keys(aRecord);
  if (aKeys.length !== Object.keys(bRecord).length) {
    return false;
  }
  return aKeys.every((key) => Object.is(aRecord[key], bRecord[key]));
}

/** Default view: the lone prop's value (`data`), else the props object. */
function defaultToView(inputs: object): unknown {
  const keys = Object.keys(inputs);
  return keys.length === 1
    ? (inputs as Record<string, unknown>)[keys[0] as string]
    : inputs;
}

function defaultFromView<T extends object>(view: unknown, inputs: T): T {
  const keys = Object.keys(inputs);
  if (keys.length === 1) {
    return { ...inputs, [keys[0] as string]: view };
  }
  if (view && typeof view === "object" && !Array.isArray(view)) {
    const next: Record<string, unknown> = {
      ...(inputs as Record<string, unknown>),
    };
    for (const key of keys) {
      if (key in view) {
        next[key] = (view as Record<string, unknown>)[key];
      }
    }
    return next as T;
  }
  return inputs;
}

export function createChartDataOverrideStore(): ChartDataOverrideStore {
  const order: string[] = [];
  const registrations = new Map<string, Registration>();
  const slotListeners = new Set<() => void>();
  const overrideListeners = new Set<() => void>();
  let overrides: readonly unknown[] | null = null;
  let slots: readonly ChartDataSlot[] | null = null;

  const emit = (listeners: Set<() => void>) => {
    for (const listener of listeners) {
      listener();
    }
  };
  const slotsChanged = () => {
    slots = null;
    emit(slotListeners);
  };

  return {
    getSlots() {
      if (!slots) {
        const next: ChartDataSlot[] = [];
        for (const id of order) {
          const registration = registrations.get(id);
          if (registration?.inputs) {
            next.push({
              id,
              component: registration.component,
              view: registration.view,
            });
          }
        }
        slots = next;
      }
      return slots;
    },
    subscribeSlots(listener) {
      slotListeners.add(listener);
      return () => slotListeners.delete(listener);
    },
    setOverrides(views) {
      const unchanged =
        views === overrides ||
        (views &&
          overrides &&
          views.length === overrides.length &&
          views.every((view, index) => Object.is(view, overrides?.[index])));
      overrides = views;
      if (!unchanged) {
        emit(overrideListeners);
      }
    },
    getOverride(id) {
      if (!overrides) {
        return;
      }
      const index = order.indexOf(id);
      return index === -1 ? undefined : overrides[index];
    },
    subscribeOverrides(listener) {
      overrideListeners.add(listener);
      return () => overrideListeners.delete(listener);
    },
    register(id, component) {
      order.push(id);
      registrations.set(id, {
        component,
        inputs: undefined,
        codec: undefined,
        view: undefined,
      });
      slotsChanged();
      emit(overrideListeners);
      return () => {
        const index = order.indexOf(id);
        if (index !== -1) {
          order.splice(index, 1);
        }
        registrations.delete(id);
        slotsChanged();
        emit(overrideListeners);
      };
    },
    update(id, inputs, codec) {
      const registration = registrations.get(id);
      if (!registration || shallowEqual(registration.inputs, inputs)) {
        return;
      }
      registration.inputs = inputs;
      registration.codec = codec;
      registration.view = (codec?.toView ?? defaultToView)(inputs);
      slotsChanged();
    },
  };
}

const ChartDataOverrideContext = createContext<ChartDataOverrideStore | null>(
  null
);

export function ChartDataOverrideProvider({
  store,
  children,
}: {
  store: ChartDataOverrideStore;
  children: ReactNode;
}) {
  return (
    <ChartDataOverrideContext.Provider value={store}>
      {children}
    </ChartDataOverrideContext.Provider>
  );
}

/**
 * Content derived from a chart's own context (`RadialLegend`, the profit /
 * loss legend) already follows edited data: it opts out of registering.
 */
export function ChartDataOverrideExempt({ children }: { children: ReactNode }) {
  return (
    <ChartDataOverrideContext.Provider value={null}>
      {children}
    </ChartDataOverrideContext.Provider>
  );
}

const noOverride = () => undefined;

function useRegisteredChartData<T extends object>(
  store: ChartDataOverrideStore,
  component: string,
  inputs: T,
  codec: ChartDataOverrideCodec<T> | undefined
): T {
  const id = useId();
  const view = useSyncExternalStore(
    store.subscribeOverrides,
    () => store.getOverride(id),
    noOverride
  );
  useLayoutEffect(() => store.register(id, component), [store, id, component]);
  // Every render: the store ignores unchanged (shallow-equal) inputs.
  useLayoutEffect(() => {
    store.update(
      id,
      inputs,
      codec as ChartDataOverrideCodec<object> | undefined
    );
  });

  // Rebuild only when the edited view or an input prop changes, so the
  // chart's own memos (keyed on `data`) stay stable across renders.
  const cacheRef = useRef<{ view: unknown; inputs: T; result: T } | null>(null);
  if (view === undefined) {
    cacheRef.current = null;
    return inputs;
  }
  const cached = cacheRef.current;
  if (cached && cached.view === view && shallowEqual(cached.inputs, inputs)) {
    return cached.result;
  }
  const result = (codec?.fromView ?? defaultFromView)(view, inputs);
  cacheRef.current = { view, inputs, result };
  return result;
}

/**
 * Returns `inputs` unchanged unless a `ChartDataOverrideProvider` is above the
 * chart and holds an edited view for it. Call once at a chart root with the
 * props its scales, layout and legends derive from.
 */
export function useChartDataOverride<T extends object>(
  component: string,
  inputs: T,
  codec?: ChartDataOverrideCodec<T>
): T {
  const store = useContext(ChartDataOverrideContext);
  if (!store) {
    return inputs;
  }
  // Whether a provider is present is fixed for a mounted chart (it only wraps
  // the present dialog's stage), so the hook order never changes.
  // eslint-disable-next-line react-hooks/rules-of-hooks -- see above
  return useRegisteredChartData(store, component, inputs, codec);
}
