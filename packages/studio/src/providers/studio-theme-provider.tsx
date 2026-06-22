"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "studio-theme";
const SITE_THEME_STORAGE_KEY = "theme";

export type StudioTheme = "light" | "dark";

interface StudioThemeContextValue {
  resolvedTheme: StudioTheme;
  setTheme: (theme: StudioTheme) => void;
  toggleTheme: () => void;
}

const StudioThemeContext = createContext<StudioThemeContextValue | null>(null);

/** Resolved site theme from next-themes (`class` on `documentElement`). */
function readSiteTheme(): StudioTheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function readThemeFromUrl(): StudioTheme | null {
  const value = new URLSearchParams(window.location.search).get("theme");
  if (value === "dark" || value === "light") {
    return value;
  }
  return null;
}

function readThemeFromStorage(): StudioTheme | null {
  try {
    const stored = localStorage.getItem(SITE_THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      return stored;
    }
    if (stored === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
  } catch {
    // localStorage may be unavailable in embedded contexts.
  }
  return null;
}

export function StudioThemeProvider({
  children,
  embedded = false,
  onThemeChange,
}: {
  children: ReactNode;
  /** Docs/catalog previews — drop full-height editor shell layout. */
  embedded?: boolean;
  /** Keep site theme in sync when the user toggles inside Studio. */
  onThemeChange?: (theme: StudioTheme) => void;
}) {
  const [resolvedTheme, setResolvedTheme] = useState<StudioTheme>("light");

  const syncFromDocument = useCallback(() => {
    setResolvedTheme(readSiteTheme());
  }, []);

  useEffect(() => {
    // Drop legacy persisted studio theme — site theme is the source of truth.
    if (!embedded) {
      localStorage.removeItem(STORAGE_KEY);
    }

    setResolvedTheme(
      readThemeFromUrl() ?? readThemeFromStorage() ?? readSiteTheme()
    );

    const observer = new MutationObserver(syncFromDocument);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [embedded, syncFromDocument]);

  const setTheme = useCallback(
    (theme: StudioTheme) => {
      setResolvedTheme(theme);
      onThemeChange?.(theme);
    },
    [onThemeChange]
  );

  const toggleTheme = useCallback(() => {
    setResolvedTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      onThemeChange?.(next);
      return next;
    });
  }, [onThemeChange]);

  return (
    <StudioThemeContext.Provider
      value={{ resolvedTheme, setTheme, toggleTheme }}
    >
      <div
        className={cn(
          "studio-shell relative bg-background text-foreground",
          embedded
            ? "min-h-[inherit] w-full min-w-0"
            : "flex h-full min-h-0 flex-1 flex-col overflow-hidden",
          resolvedTheme === "dark" && "dark"
        )}
      >
        {children}
      </div>
    </StudioThemeContext.Provider>
  );
}

export function useStudioTheme() {
  const context = useContext(StudioThemeContext);
  if (!context) {
    throw new Error("useStudioTheme must be used within StudioThemeProvider");
  }
  return context;
}
