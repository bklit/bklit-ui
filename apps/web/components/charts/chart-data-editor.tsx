"use client";

import { Icon } from "@bklitui/icons";
import type {
  ChartDataOverrideStore,
  ChartDataSlot,
} from "@bklitui/ui/charts/chart-data-override";
import {
  Component,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  chartDataKind,
  type EditableData,
  parseEditableJson,
  restoreChartData,
  stringifyChartData,
  stringifyEditableData,
} from "@/components/charts/editable-data";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPopup,
  SheetTitle,
} from "@/components/ui/sheet";

/** Wait this long after typing stops before parsing and re-rendering. */
const PARSE_DEBOUNCE_MS = 300;

interface ParseError {
  message: string;
  line?: number;
  column?: number;
}

/**
 * JSON draft of an example's data. `data` only ever holds the last JSON that
 * parsed, so the chart keeps its last good state while the text is invalid.
 */
export function useEditableJson(spec: EditableData | undefined) {
  const initialText = spec ? stringifyEditableData(spec.data) : "";
  const [text, setTextState] = useState(initialText);
  const [data, setData] = useState<unknown>(spec?.data);
  const [parseError, setParseError] = useState<ParseError | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  const apply = useCallback((next: string) => {
    const result = parseEditableJson(next);
    if (result.ok) {
      setData(result.data);
      setParseError(null);
    } else {
      setParseError({
        message: result.message,
        line: result.line,
        column: result.column,
      });
    }
  }, []);

  const setText = useCallback(
    (next: string) => {
      setTextState(next);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => apply(next), PARSE_DEBOUNCE_MS);
    },
    [apply]
  );

  const reset = useCallback(() => {
    if (!spec) {
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setTextState(stringifyEditableData(spec.data));
    setData(spec.data);
    setParseError(null);
  }, [spec]);

  const format = useCallback(() => {
    const result = parseEditableJson(text);
    if (result.ok) {
      const pretty = stringifyEditableData(result.data);
      setTextState(pretty);
      setData(result.data);
      setParseError(null);
    } else {
      apply(text);
    }
  }, [apply, text]);

  return { text, setText, data, parseError, reset, format };
}

export interface EditableJsonState {
  text: string;
  setText: (next: string) => void;
  parseError: ParseError | null;
  /** Valid JSON the charts can't take (wrong kind of value). */
  dataError?: string | null;
  reset: () => void;
  format: () => void;
}

/**
 * Charts that registered the same data (a chart and its brush strip, a
 * `ChartBrushLayout` and the charts inside it) are edited as one entry.
 */
interface ChartDataGroup {
  name: string;
  view: unknown;
  /** Ordinals (in `slots`) of the charts that share this data. */
  slots: number[];
}

/** Wrappers that pass data through to the charts they render. */
const PASS_THROUGH_COMPONENTS = new Set(["ChartBrushLayout"]);

function groupChartDataSlots(
  slots: readonly ChartDataSlot[]
): ChartDataGroup[] {
  const groups: (ChartDataGroup & { component: string })[] = [];
  slots.forEach((slot, index) => {
    const shared =
      typeof slot.view === "object" && slot.view !== null
        ? groups.find((group) => group.view === slot.view)
        : undefined;
    if (shared) {
      shared.slots.push(index);
      if (PASS_THROUGH_COMPONENTS.has(shared.component)) {
        shared.component = slot.component;
      }
      return;
    }
    groups.push({
      name: "",
      component: slot.component,
      view: slot.view,
      slots: [index],
    });
  });
  // JSON keys: the component name, numbered when several charts share it.
  const totals = new Map<string, number>();
  for (const group of groups) {
    totals.set(group.component, (totals.get(group.component) ?? 0) + 1);
  }
  const seen = new Map<string, number>();
  return groups.map(({ component, ...group }) => {
    const count = (seen.get(component) ?? 0) + 1;
    seen.set(component, count);
    return {
      ...group,
      name:
        (totals.get(component) ?? 1) > 1 ? `${component} ${count}` : component,
    };
  });
}

/** One chart: its data as-is. Several: an object keyed by chart. */
function groupsDocument(groups: readonly ChartDataGroup[]): unknown {
  if (groups.length === 1) {
    return groups[0]?.view;
  }
  return Object.fromEntries(groups.map((group) => [group.name, group.view]));
}

const KIND_ARTICLE: Record<string, string> = {
  array: "an array",
  object: "an object",
  number: "a number",
  string: "a string",
  boolean: "a boolean",
  null: "null",
};

type RestoreCache = Map<
  string,
  { edited: unknown; template: unknown; restored: unknown }
>;

/** Error message when `edited` isn't the kind of value the chart's data is. */
function kindMismatch(
  edited: unknown,
  group: ChartDataGroup,
  single: boolean
): string | null {
  const expected = chartDataKind(group.view);
  if (!expected || expected === "null" || chartDataKind(edited) === expected) {
    return null;
  }
  const subject = single ? "The data" : `"${group.name}"`;
  return `${subject} should be ${KIND_ARTICLE[expected]}`;
}

/**
 * `edited` restored against the chart's data (dates, placeholders). Same edit
 * + same chart data → same object, so charts don't re-render (and
 * re-register) when unrelated slots change; a chart whose data prop is
 * rebuilt every render (same content, new array) is compared by content so
 * it can't loop.
 */
function restoreCached(
  edited: unknown,
  group: ChartDataGroup,
  cache: RestoreCache
): unknown {
  const cached = cache.get(group.name);
  const sameTemplate =
    cached !== undefined &&
    (cached.template === group.view ||
      stringifyChartData(cached.template) === stringifyChartData(group.view));
  const restored =
    cached?.edited === edited && sameTemplate
      ? cached.restored
      : restoreChartData(edited, group.view);
  cache.set(group.name, { edited, template: group.view, restored });
  return restored;
}

/**
 * Per-slot edited views for `document`, or an error when a chart's entry
 * isn't the same kind of value as its own data (an object for an array…),
 * which the chart couldn't render.
 */
function resolveOverrides(
  document: unknown,
  groups: readonly ChartDataGroup[],
  slotCount: number,
  cache: RestoreCache
): { ok: true; views: unknown[] } | { ok: false; message: string } {
  const views: unknown[] = new Array(slotCount).fill(undefined);
  const single = groups.length === 1;
  if (!(single || (document && typeof document === "object"))) {
    return { ok: false, message: "Expected an object keyed by chart" };
  }
  for (const group of groups) {
    const edited = single
      ? document
      : (document as Record<string, unknown>)[group.name];
    if (edited === undefined) {
      continue;
    }
    const mismatch = kindMismatch(edited, group, single);
    if (mismatch) {
      return { ok: false, message: mismatch };
    }
    const restored = restoreCached(edited, group, cache);
    for (const slot of group.slots) {
      views[slot] = restored;
    }
  }
  return { ok: true, views };
}

const NO_SLOTS: readonly ChartDataSlot[] = [];
const noopSubscribe = () => () => undefined;

/**
 * JSON editor state for whatever chart roots registered their data with
 * `store` (see `@bklitui/ui/charts/chart-data-override`). Until the user
 * types, the text follows the charts' own data; edits are pushed back to the
 * charts as overrides. A render error rolls back to the last edit that
 * rendered and remounts the charts (`resetKey`).
 */
export function useChartDataOverrides(store: ChartDataOverrideStore | null) {
  const slots = useSyncExternalStore(
    store?.subscribeSlots ?? noopSubscribe,
    store?.getSlots ?? (() => NO_SLOTS),
    () => NO_SLOTS
  );
  const groups = useMemo(() => groupChartDataSlots(slots), [slots]);
  const pristineText = useMemo(
    () => (groups.length > 0 ? stringifyChartData(groupsDocument(groups)) : ""),
    [groups]
  );
  /** `null` until the user edits: the text tracks the charts' data. */
  const [draft, setDraft] = useState<string | null>(null);
  /** Last parsed document (`null`: no edits applied). */
  const [document, setDocument] = useState<{ value: unknown } | null>(null);
  const [parseError, setParseError] = useState<ParseError | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastGoodRef = useRef<{ value: unknown } | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  const restoreCacheRef = useRef<RestoreCache>(new Map());
  const resolved = useMemo(
    () =>
      document
        ? resolveOverrides(
            document.value,
            groups,
            slots.length,
            restoreCacheRef.current
          )
        : null,
    [document, groups, slots.length]
  );

  useEffect(() => {
    if (!store) {
      return;
    }
    store.setOverrides(resolved?.ok ? resolved.views : null);
    if (!resolved?.ok) {
      return;
    }
    // Rendered without throwing (errors surface synchronously): keep it.
    const timer = setTimeout(() => {
      lastGoodRef.current = document;
    }, 50);
    return () => clearTimeout(timer);
  }, [store, resolved, document]);

  // Once the store is gone (dialog closed), drop the overrides.
  useEffect(() => () => store?.setOverrides(null), [store]);

  const apply = useCallback((next: string) => {
    const result = parseEditableJson(next, { revive: false });
    if (result.ok) {
      setDocument({ value: result.data });
      setParseError(null);
      setRenderError(null);
    } else {
      setParseError({
        message: result.message,
        line: result.line,
        column: result.column,
      });
    }
  }, []);

  const setText = useCallback(
    (next: string) => {
      setDraft(next);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => apply(next), PARSE_DEBOUNCE_MS);
    },
    [apply]
  );

  const text = draft ?? pristineText;

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setDraft(null);
    setDocument(null);
    setParseError(null);
    setRenderError(null);
    lastGoodRef.current = null;
  }, []);

  const format = useCallback(() => {
    const result = parseEditableJson(text, { revive: false });
    if (result.ok) {
      setDraft(JSON.stringify(result.data, null, 2));
      setDocument({ value: result.data });
      setParseError(null);
    } else {
      apply(text);
    }
  }, [apply, text]);

  const documentRef = useRef(document);
  documentRef.current = document;
  const onRenderError = useCallback((message: string) => {
    setRenderError(message);
    // Unedited data failing isn't the editor's to fix: don't remount-loop.
    if (documentRef.current === null) {
      return;
    }
    setDocument(lastGoodRef.current);
    setResetKey((key) => key + 1);
  }, []);

  const state: EditableJsonState = {
    text,
    setText,
    parseError,
    dataError: resolved && !resolved.ok ? resolved.message : null,
    reset,
    format,
  };

  // Sticky: charts remounting after a render error mustn't hide the editor.
  const availableRef = useRef(false);
  if (groups.length > 0) {
    availableRef.current = true;
  }

  return {
    /** Some chart registered data: the editor has something to show. */
    available: availableRef.current,
    state,
    renderError,
    resetKey,
    onRenderError,
  };
}

/**
 * Error boundary for charts rendering overridden data: reports the error
 * (the host rolls back and remounts it with a new `key`) and renders nothing
 * meanwhile.
 */
export class ChartOverrideBoundary extends Component<
  { onRenderError: (message: string) => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    this.props.onRenderError(error.message);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Renders `render(data)`; if that throws (a shape the chart can't handle) it
 * keeps showing the last data that rendered and reports the error.
 */
export class ChartRenderBoundary extends Component<
  {
    data: unknown;
    render: (data: unknown) => ReactNode;
    onRenderError: (message: string | null) => void;
  },
  { error: Error | null; goodData: unknown }
> {
  state = { error: null as Error | null, goodData: this.props.data };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onRenderError(error.message);
  }

  componentDidUpdate(previous: { data: unknown }) {
    if (previous.data !== this.props.data && this.state.error) {
      // New data after a failed render: try it.
      this.setState({ error: null });
      return;
    }
    if (!this.state.error && this.state.goodData !== this.props.data) {
      this.setState({ goodData: this.props.data });
      this.props.onRenderError(null);
    }
  }

  render() {
    const data = this.state.error ? this.state.goodData : this.props.data;
    return this.props.render(data);
  }
}

/**
 * Inset sheet with a JSON editor for the example's data: debounced parse,
 * inline parse / render errors, Format and Reset. Non-modal and without a
 * backdrop so the chart stays visible (and hoverable) while editing.
 */
export function ChartDataEditorSheet({
  open,
  onOpenChange,
  state,
  renderError,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: EditableJsonState;
  renderError: string | null;
}) {
  const { text, setText, parseError, dataError, reset, format } = state;
  const errorId = "chart-data-json-error";
  let error: string | null = null;
  if (parseError) {
    error =
      parseError.line === undefined
        ? `Invalid JSON: ${parseError.message}`
        : `Invalid JSON at line ${parseError.line}, column ${parseError.column}: ${parseError.message}`;
  } else if (dataError) {
    error = dataError;
  } else if (renderError) {
    error = `The chart couldn't render this data: ${renderError}`;
  }

  return (
    <Sheet
      disablePointerDismissal
      modal={false}
      onOpenChange={onOpenChange}
      open={open}
    >
      <SheetPopup
        className="dark max-w-sm"
        showBackdrop={false}
        side="right"
        variant="inset"
        viewportClassName="pointer-events-none *:pointer-events-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-base">Edit data</SheetTitle>
          <SheetDescription>
            JSON. The chart and export update as you type; edits aren&apos;t
            saved.
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-2 px-6 pb-4">
          <textarea
            aria-describedby={error ? errorId : undefined}
            aria-invalid={parseError || dataError ? true : undefined}
            aria-label="Chart data (JSON)"
            className="min-h-0 w-full flex-1 resize-none rounded-lg border border-input bg-input/32 p-3 font-mono text-[12px] text-foreground leading-relaxed caret-foreground shadow-xs/5 outline-none [tab-size:2] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/24 aria-invalid:border-destructive/64"
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              // Tab indents instead of leaving the editor.
              if (event.key === "Tab" && !event.shiftKey) {
                event.preventDefault();
                const target = event.currentTarget;
                const { selectionStart, selectionEnd, value } = target;
                const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
                setText(next);
                requestAnimationFrame(() => {
                  target.selectionStart = selectionStart + 2;
                  target.selectionEnd = selectionStart + 2;
                });
              }
            }}
            spellCheck={false}
            value={text}
          />
          <p
            aria-live="polite"
            className="m-0 min-h-4 text-destructive-foreground text-xs"
            id={errorId}
          >
            {error}
          </p>
        </div>
        <SheetFooter className="sm:justify-between">
          <Button onClick={reset} size="sm" type="button" variant="ghost">
            <Icon className="size-4" name="IconArrowRotateClockwise" />
            Reset
          </Button>
          <Button onClick={format} size="sm" type="button" variant="outline">
            Format
          </Button>
        </SheetFooter>
      </SheetPopup>
    </Sheet>
  );
}
