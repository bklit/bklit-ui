"use client";

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined" || !("op" in window)) {
    return;
  }

  (window.op as unknown as (...args: unknown[]) => void)(
    "track",
    name,
    properties
  );
}

export function getAnalyticsUrl() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.location.href;
}
