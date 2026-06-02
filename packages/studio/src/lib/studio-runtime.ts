/** True when Studio is running inside a Tauri webview (desktop app). */
export function isTauriRuntime(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return "__TAURI_INTERNALS__" in window || "__TAURI__" in window;
}

/** Record and SVG export are web-only until Tauri capture/export is supported. */
export function supportsStudioExportFeatures(): boolean {
  return !isTauriRuntime();
}
