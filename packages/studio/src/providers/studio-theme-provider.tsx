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

type StudioTheme = "light" | "dark";

interface StudioThemeContextValue {
  resolvedTheme: StudioTheme;
  setTheme: (theme: StudioTheme) => void;
  toggleTheme: () => void;
}

const StudioThemeContext = createContext<StudioThemeContextValue | null>(null);

function readStoredTheme(): StudioTheme | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return null;
}

function readSystemTheme(): StudioTheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function StudioThemeProvider({
  children,
  embedded = false,
}: {
  children: ReactNode;
  /** Docs/catalog previews — drop full-height editor shell layout. */
  embedded?: boolean;
}) {
  const [resolvedTheme, setResolvedTheme] = useState<StudioTheme>("light");
  const [mounted, setMounted] = useState(false);

  const syncFromDocument = useCallback(() => {
    setResolvedTheme(readSystemTheme());
  }, []);

  useEffect(() => {
    if (embedded) {
      syncFromDocument();
      setMounted(true);

      const observer = new MutationObserver(syncFromDocument);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => observer.disconnect();
    }

    setResolvedTheme(readStoredTheme() ?? readSystemTheme());
    setMounted(true);
  }, [embedded, syncFromDocument]);

  const setTheme = useCallback(
    (theme: StudioTheme) => {
      setResolvedTheme(theme);
      if (!embedded) {
        localStorage.setItem(STORAGE_KEY, theme);
      }
    },
    [embedded]
  );

  const toggleTheme = useCallback(() => {
    setResolvedTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      if (!embedded) {
        localStorage.setItem(STORAGE_KEY, next);
      }
      return next;
    });
  }, [embedded]);

  const theme = mounted ? resolvedTheme : "light";

  return (
    <StudioThemeContext.Provider
      value={{ resolvedTheme: theme, setTheme, toggleTheme }}
    >
      <div
        className={cn(
          "studio-shell relative",
          embedded
            ? "min-h-[inherit] w-full min-w-0"
            : "flex h-full min-h-0 flex-1 flex-col overflow-hidden",
          theme === "dark" && "dark"
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
