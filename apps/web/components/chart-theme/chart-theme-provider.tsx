"use client";

import type {
  ChartPalette,
  ChartPaletteVarName,
} from "@bklitui/studio/chart-palettes";
import { useTheme } from "next-themes";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  applyChartThemeVars,
  type ChartThemeMode,
  type ChartThemePreview,
  resolveChartThemeModeFromElement,
} from "@/lib/apply-chart-theme-vars";
import { setChartThemeCookie } from "@/lib/chart-theme-cookie";
import {
  clearCustomChartTheme,
  readCustomChartTheme,
  writeCustomChartTheme,
} from "@/lib/chart-theme-custom-storage";
import {
  CUSTOM_CHART_THEME_ID,
  chartThemes,
  createCustomChartTheme,
  DEFAULT_CHART_THEME_ID,
  getChartTheme,
} from "@/lib/chart-themes";

interface ChartThemeContextValue {
  /** Built-in palette id or `custom`. */
  themeId: string;
  /** Active palette (custom colors when `themeId === "custom"`). */
  theme: ChartPalette;
  themes: ChartPalette[];
  customTheme: ChartPalette | null;
  /** Mode whose colors are edited by `previewColor` / `setColor` (site light/dark). */
  editMode: ChartThemeMode;
  setThemeId: (id: string) => void;
  /** Live edit while dragging — applied to the page, not persisted. */
  previewColor: (name: ChartPaletteVarName, value: string) => void;
  /** Commit an edit: forks the active palette into `custom` and persists it. */
  setColor: (name: ChartPaletteVarName, value: string) => void;
  /** Delete the custom palette and return to the default palette. */
  resetCustomTheme: () => void;
}

const ChartThemeContext = createContext<ChartThemeContextValue | null>(null);

export function useChartTheme() {
  const context = useContext(ChartThemeContext);

  if (!context) {
    throw new Error("useChartTheme must be used within ChartThemeProvider");
  }

  return context;
}

function readModes() {
  const rootMode = resolveChartThemeModeFromElement(document.documentElement);
  const studioShell = document.querySelector<HTMLElement>(".studio-shell");
  const studioMode = studioShell
    ? resolveChartThemeModeFromElement(studioShell)
    : rootMode;
  return { rootMode, studioMode, studioShell };
}

export function ChartThemeProvider({
  children,
  initialThemeId = DEFAULT_CHART_THEME_ID,
}: {
  children: ReactNode;
  initialThemeId?: string;
}) {
  const { resolvedTheme } = useTheme();
  const [themeId, setThemeIdState] = useState(initialThemeId);
  // Provider renders no palette-dependent markup, so reading storage here is hydration-safe.
  const [customTheme, setCustomTheme] = useState<ChartPalette | null>(() =>
    typeof window === "undefined" ? null : readCustomChartTheme()
  );
  const previewRef = useRef<ChartThemePreview>(null);

  const theme =
    themeId === CUSTOM_CHART_THEME_ID && customTheme
      ? customTheme
      : getChartTheme(themeId);
  const editMode: ChartThemeMode = resolvedTheme === "dark" ? "dark" : "light";

  const applyTheme = useCallback((nextTheme: ChartPalette) => {
    const { rootMode, studioMode, studioShell } = readModes();
    applyChartThemeVars(nextTheme, {
      rootMode,
      studioMode,
      studioElement: studioShell,
      preview: previewRef.current,
    });
  }, []);

  // `custom` cookie without stored colors (cleared storage, other browser) → default.
  useEffect(() => {
    if (themeId === CUSTOM_CHART_THEME_ID && !customTheme) {
      setThemeIdState(DEFAULT_CHART_THEME_ID);
      setChartThemeCookie(DEFAULT_CHART_THEME_ID);
    }
  }, [themeId, customTheme]);

  // `resolvedTheme` re-applies the palette when the site light/dark mode changes.
  useEffect(() => {
    applyTheme(theme);
  }, [applyTheme, theme, resolvedTheme]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      applyTheme(theme);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [applyTheme, theme]);

  const setThemeId = useCallback(
    (id: string) => {
      const nextId =
        id === CUSTOM_CHART_THEME_ID && customTheme
          ? CUSTOM_CHART_THEME_ID
          : getChartTheme(id).id;
      previewRef.current = null;
      setThemeIdState(nextId);
      setChartThemeCookie(nextId);
      applyTheme(
        nextId === CUSTOM_CHART_THEME_ID && customTheme
          ? customTheme
          : getChartTheme(nextId)
      );
    },
    [applyTheme, customTheme]
  );

  const previewColor = useCallback(
    (name: ChartPaletteVarName, value: string) => {
      const current = previewRef.current;
      previewRef.current = {
        mode: editMode,
        vars: {
          ...(current?.mode === editMode ? current.vars : {}),
          [name]: value,
        },
      };
      applyTheme(theme);
    },
    [applyTheme, editMode, theme]
  );

  const setColor = useCallback(
    (name: ChartPaletteVarName, value: string) => {
      const nextTheme = createCustomChartTheme({
        light: { ...theme.light },
        dark: { ...theme.dark },
      });
      nextTheme[editMode] = { ...nextTheme[editMode], [name]: value };
      previewRef.current = null;
      writeCustomChartTheme(nextTheme);
      setCustomTheme(nextTheme);
      setThemeIdState(CUSTOM_CHART_THEME_ID);
      setChartThemeCookie(CUSTOM_CHART_THEME_ID);
      applyTheme(nextTheme);
    },
    [applyTheme, editMode, theme]
  );

  const resetCustomTheme = useCallback(() => {
    clearCustomChartTheme();
    setCustomTheme(null);
    previewRef.current = null;
    if (themeId === CUSTOM_CHART_THEME_ID) {
      setThemeIdState(DEFAULT_CHART_THEME_ID);
      setChartThemeCookie(DEFAULT_CHART_THEME_ID);
      applyTheme(getChartTheme(DEFAULT_CHART_THEME_ID));
    }
  }, [applyTheme, themeId]);

  const value = useMemo(
    () => ({
      themeId: theme.id,
      theme,
      themes: chartThemes,
      customTheme,
      editMode,
      setThemeId,
      previewColor,
      setColor,
      resetCustomTheme,
    }),
    [
      theme,
      customTheme,
      editMode,
      setThemeId,
      previewColor,
      setColor,
      resetCustomTheme,
    ]
  );

  return (
    <ChartThemeContext.Provider value={value}>
      {children}
    </ChartThemeContext.Provider>
  );
}
