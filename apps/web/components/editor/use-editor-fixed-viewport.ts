"use client";

import { useEffect } from "react";

const MOBILE_VIEWPORT_CONTENT = "width=device-width, initial-scale=1";

export function useEditorFixedViewport(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const previous = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      bodyMinHeight: body.style.minHeight,
      bodyOverscroll: body.style.overscrollBehavior,
      viewportContent: viewportMeta?.getAttribute("content") ?? null,
    };

    html.style.overflow = "hidden";
    html.style.height = "100%";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.height = "100%";
    body.style.minHeight = "100%";
    body.style.overscrollBehavior = "none";

    if (viewportMeta) {
      viewportMeta.setAttribute("content", MOBILE_VIEWPORT_CONTENT);
    }

    return () => {
      html.style.overflow = previous.htmlOverflow;
      html.style.height = previous.htmlHeight;
      html.style.overscrollBehavior = previous.htmlOverscroll;
      body.style.overflow = previous.bodyOverflow;
      body.style.height = previous.bodyHeight;
      body.style.minHeight = previous.bodyMinHeight;
      body.style.overscrollBehavior = previous.bodyOverscroll;

      if (viewportMeta && previous.viewportContent !== null) {
        viewportMeta.setAttribute("content", previous.viewportContent);
      }
    };
  }, [enabled]);
}
