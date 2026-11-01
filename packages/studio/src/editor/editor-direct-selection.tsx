"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOptionalStudioComponentSelection } from "@/editor/studio-component-selection";
import { STUDIO_SERIES_KEYS } from "@/lib/demo-data";
import {
  collectLayerElements,
  hitTestStudioLayer,
  type ScreenRect,
  type StudioLayerLookup,
  unionClientRect,
} from "@/lib/studio-layer-hit-test";

const CHART_CONTENT_SELECTOR = "[data-studio-chart-content]";
const CLICK_SLOP_PX = 4;
const ELEMENT_CACHE_MS = 400;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return (
    target.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}

/** V enters direct selection; H leaves it. Esc is handled by the overlay. */
export function useDirectSelectionShortcuts({
  enabled,
  onActiveChange,
}: {
  enabled: boolean;
  onActiveChange: (active: boolean) => void;
}) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      // Shift+H toggles the selected layer's visibility (components panel).
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      if (isTypingTarget(event.target)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "v") {
        event.preventDefault();
        onActiveChange(true);
      } else if (key === "h") {
        event.preventDefault();
        onActiveChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onActiveChange]);
}

/**
 * Direct-selection tool state for the canvas. Full editor only — embeds,
 * static previews and mobile keep the chart interactive.
 */
export function useEditorDirectSelect(enabled: boolean) {
  const [active, setActive] = useState(false);
  const exit = useCallback(() => setActive(false), []);
  useDirectSelectionShortcuts({ enabled, onActiveChange: setActive });
  return {
    active: enabled && active,
    exit,
    onActiveChange: enabled ? setActive : undefined,
  };
}

interface LayerMeasureCache {
  id: string | null;
  elements: Element[];
  collectedAt: number;
}

function measureLayer(
  cache: LayerMeasureCache,
  contentRoot: HTMLElement | null,
  id: string | null,
  lookup: StudioLayerLookup,
  now: number
): ScreenRect | null {
  if (!(id && contentRoot)) {
    cache.id = null;
    cache.elements = [];
    return null;
  }
  if (
    cache.id !== id ||
    now - cache.collectedAt > ELEMENT_CACHE_MS ||
    cache.elements.some((element) => !element.isConnected)
  ) {
    cache.id = id;
    cache.elements = collectLayerElements(contentRoot, id, lookup);
    cache.collectedAt = now;
  }
  return unionClientRect(cache.elements);
}

function placeBox(
  box: HTMLDivElement | null,
  rect: ScreenRect | null,
  origin: DOMRect
) {
  if (!box) {
    return;
  }
  if (!rect) {
    box.style.display = "none";
    return;
  }
  box.style.display = "block";
  box.style.transform = `translate(${rect.left - origin.left}px, ${
    rect.top - origin.top
  }px)`;
  box.style.width = `${Math.max(1, rect.right - rect.left)}px`;
  box.style.height = `${Math.max(1, rect.bottom - rect.top)}px`;
}

/**
 * Figma-style direct selection over the canvas: hover outlines a chart layer,
 * click selects it in the components panel. Boxes are measured in screen
 * space every frame, so they track camera pan/zoom and chart animation.
 * Pan (space/middle drag) and wheel still reach the canvas handlers — this
 * only listens alongside them.
 */
export function EditorDirectSelectionOverlay({
  viewportRef,
  spacePressed,
  onExit,
}: {
  viewportRef: RefObject<HTMLDivElement | null>;
  spacePressed: boolean;
  onExit: () => void;
}) {
  const selection = useOptionalStudioComponentSelection();
  const components = selection?.components;
  const selectedComponentId = selection?.selectedComponentId ?? null;
  const setSelectedComponentId = selection?.setSelectedComponentId;

  const lookup = useMemo((): StudioLayerLookup => {
    const ids = (components ?? []).map((component) => component.id);
    return {
      ids: new Set(ids),
      prefix: ids[0]?.split(".")[0] ?? "",
      seriesKeys: STUDIO_SERIES_KEYS,
    };
  }, [components]);
  const labels = useMemo(
    () =>
      new Map(
        (components ?? []).map((component) => [component.id, component.label])
      ),
    [components]
  );

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Esc / empty click hides the box without changing the panel selection.
  const [clearedId, setClearedId] = useState<string | null>(null);
  const boxId =
    selectedComponentId && selectedComponentId !== clearedId
      ? selectedComponentId
      : null;

  const rootRef = useRef<HTMLDivElement>(null);
  const hoverBoxRef = useRef<HTMLDivElement>(null);
  const selectBoxRef = useRef<HTMLDivElement>(null);
  const spacePressedRef = useRef(spacePressed);
  spacePressedRef.current = spacePressed;
  const lookupRef = useRef(lookup);
  lookupRef.current = lookup;
  const boxIdRef = useRef(boxId);
  boxIdRef.current = boxId;
  const hoveredIdRef = useRef(hoveredId);
  hoveredIdRef.current = hoveredId;

  // Mark the viewport so chart content stops receiving the pointer.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    viewport.dataset.studioDirectSelect = "";
    return () => {
      delete viewport.dataset.studioDirectSelect;
    };
  }, [viewportRef]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    let frame = 0;
    let lastPointer: { x: number; y: number } | null = null;
    let downAt: { x: number; y: number; pointerId: number } | null = null;

    const hitTest = (x: number, y: number) => {
      const contentRoot = viewport.querySelector<HTMLElement>(
        CHART_CONTENT_SELECTOR
      );
      if (!contentRoot) {
        return null;
      }
      return hitTestStudioLayer(contentRoot, x, y, lookupRef.current);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.buttons !== 0 || spacePressedRef.current) {
        return;
      }
      lastPointer = { x: event.clientX, y: event.clientY };
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (lastPointer) {
          setHoveredId(hitTest(lastPointer.x, lastPointer.y));
        }
      });
    };

    const onPointerLeave = () => {
      lastPointer = null;
      setHoveredId(null);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || spacePressedRef.current) {
        downAt = null;
        return;
      }
      if (
        event.target instanceof Element &&
        event.target.closest("button, input, textarea, select")
      ) {
        downAt = null;
        return;
      }
      downAt = {
        x: event.clientX,
        y: event.clientY,
        pointerId: event.pointerId,
      };
    };

    const onPointerUp = (event: PointerEvent) => {
      const start = downAt;
      downAt = null;
      if (!start || start.pointerId !== event.pointerId) {
        return;
      }
      if (
        Math.hypot(event.clientX - start.x, event.clientY - start.y) >
        CLICK_SLOP_PX
      ) {
        return;
      }
      const id = hitTest(event.clientX, event.clientY);
      if (id) {
        setSelectedComponentId?.(id);
        setClearedId(null);
      } else {
        setClearedId(boxIdRef.current);
      }
    };

    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerleave", onPointerLeave);
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointerup", onPointerUp);
    return () => {
      window.cancelAnimationFrame(frame);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerleave", onPointerLeave);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointerup", onPointerUp);
    };
  }, [setSelectedComponentId, viewportRef]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isTypingTarget(event.target)) {
        return;
      }
      if (boxIdRef.current) {
        setClearedId(boxIdRef.current);
      } else {
        onExit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onExit]);

  // Track boxes every frame (camera, resize and chart motion all move them).
  useEffect(() => {
    const hoverCache: LayerMeasureCache = {
      id: null,
      elements: [],
      collectedAt: 0,
    };
    const selectCache: LayerMeasureCache = {
      id: null,
      elements: [],
      collectedAt: 0,
    };
    let frame = 0;

    const tick = (now: number) => {
      frame = window.requestAnimationFrame(tick);
      const root = rootRef.current;
      const contentRoot =
        viewportRef.current?.querySelector<HTMLElement>(
          CHART_CONTENT_SELECTOR
        ) ?? null;
      if (!root) {
        return;
      }
      const origin = root.getBoundingClientRect();
      const selectedId = boxIdRef.current;
      const hovered = hoveredIdRef.current;
      placeBox(
        selectBoxRef.current,
        measureLayer(
          selectCache,
          contentRoot,
          selectedId,
          lookupRef.current,
          now
        ),
        origin
      );
      placeBox(
        hoverBoxRef.current,
        hovered === selectedId
          ? null
          : measureLayer(
              hoverCache,
              contentRoot,
              hovered,
              lookupRef.current,
              now
            ),
        origin
      );
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [viewportRef]);

  const hoverLabel = hoveredId ? (labels.get(hoveredId) ?? hoveredId) : null;
  const selectLabel = boxId ? (labels.get(boxId) ?? boxId) : null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      ref={rootRef}
    >
      <div
        className="absolute top-0 left-0 hidden outline-1 outline-blue-500"
        ref={selectBoxRef}
      >
        {hoveredId && hoveredId !== boxId ? null : (
          <SelectionLabel label={selectLabel} />
        )}
      </div>
      <div
        className="absolute top-0 left-0 hidden outline-1 outline-blue-500/80"
        ref={hoverBoxRef}
      >
        <SelectionLabel label={hoverLabel} />
      </div>
    </div>
  );
}

function SelectionLabel({ label }: { label: string | null }) {
  if (!label) {
    return null;
  }
  return (
    <span className="absolute bottom-full left-[-1px] mb-1 whitespace-nowrap rounded-sm bg-blue-500 px-1 py-px font-medium text-[10px] text-white leading-tight">
      {label}
    </span>
  );
}
