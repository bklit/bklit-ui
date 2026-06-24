"use client";

import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BKLIT_CHART_THEME_TOKEN_DEFAULTS,
  BKLIT_CHART_THEME_TOKEN_NAMES,
  type BklitChartThemeTokenName,
  type BklitChartThemeTokens,
  formatBklitChartThemeTokensCss,
} from "@/lib/bklit-chart-theme-tokens";
import {
  BKLIT_SHADCN_THEME_TOKEN_DEFAULTS,
  BKLIT_SHADCN_THEME_TOKEN_NAMES,
  type BklitShadcnThemeTokenName,
  type BklitShadcnThemeTokens,
  type BklitThemeMode,
  formatBklitShadcnThemeTokensCss,
} from "@/lib/bklit-shadcn-theme-tokens";
import { normalizeThemeTokenColor } from "@/lib/chart-theme-color";
import { useStudioTheme } from "@/providers/studio-theme-provider";

function readThemeTokensFromShell<T extends string>(
  shell: Element,
  names: readonly T[],
  fallbacks: Record<T, string>
): Record<T, string> {
  const styles = getComputedStyle(shell);
  const tokens = { ...fallbacks };

  for (const name of names) {
    const value = styles.getPropertyValue(`--${name}`).trim();
    if (value) {
      tokens[name] = normalizeThemeTokenColor(value);
    }
  }

  return tokens;
}

function themeOverridesToCssProperties(
  shadcnOverrides: Partial<BklitShadcnThemeTokens>,
  chartOverrides: Partial<BklitChartThemeTokens>
): CSSProperties | undefined {
  const style: Record<string, string> = {};

  for (const [name, value] of Object.entries(shadcnOverrides)) {
    if (value !== undefined) {
      style[`--${name}`] = value;
    }
  }

  for (const [name, value] of Object.entries(chartOverrides)) {
    if (value !== undefined) {
      style[`--${name}`] = value;
    }
  }

  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined;
}

export type CatalogThemeTokenGroup = "shadcn" | "chart";

interface CatalogThemeContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  tokenGroup: CatalogThemeTokenGroup;
  setTokenGroup: (group: CatalogThemeTokenGroup) => void;
  resolvedTheme: BklitThemeMode;
  shadcnTokens: BklitShadcnThemeTokens;
  chartTokens: BklitChartThemeTokens;
  setShadcnToken: (name: BklitShadcnThemeTokenName, value: string) => void;
  setChartToken: (name: BklitChartThemeTokenName, value: string) => void;
  resetTokens: () => void;
  cssProperties: CSSProperties | undefined;
  cssBlock: string;
}

const CatalogThemeContext = createContext<CatalogThemeContextValue | null>(
  null
);

export function CatalogThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useStudioTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const [tokenGroup, setTokenGroup] =
    useState<CatalogThemeTokenGroup>("shadcn");
  const [shadcnOverrides, setShadcnOverrides] = useState<
    Partial<Record<BklitThemeMode, Partial<BklitShadcnThemeTokens>>>
  >({});
  const [chartOverrides, setChartOverrides] = useState<
    Partial<Record<BklitThemeMode, Partial<BklitChartThemeTokens>>>
  >({});
  const [cssBaseShadcn, setCssBaseShadcn] = useState<BklitShadcnThemeTokens>(
    () => BKLIT_SHADCN_THEME_TOKEN_DEFAULTS.light
  );
  const [cssBaseChart, setCssBaseChart] = useState<BklitChartThemeTokens>(
    () => BKLIT_CHART_THEME_TOKEN_DEFAULTS.light
  );

  const shadcnThemeOverrides = shadcnOverrides[resolvedTheme] ?? {};
  const chartThemeOverrides = chartOverrides[resolvedTheme] ?? {};

  const syncBaseTokensFromCss = useCallback(() => {
    const shell = containerRef.current?.closest(".studio-shell");
    if (!shell) {
      return;
    }

    setCssBaseShadcn(
      readThemeTokensFromShell(
        shell,
        BKLIT_SHADCN_THEME_TOKEN_NAMES,
        BKLIT_SHADCN_THEME_TOKEN_DEFAULTS[resolvedTheme]
      ) as BklitShadcnThemeTokens
    );
    setCssBaseChart(
      readThemeTokensFromShell(
        shell,
        BKLIT_CHART_THEME_TOKEN_NAMES,
        BKLIT_CHART_THEME_TOKEN_DEFAULTS[resolvedTheme]
      ) as BklitChartThemeTokens
    );
  }, [resolvedTheme]);

  useLayoutEffect(() => {
    syncBaseTokensFromCss();
  }, [syncBaseTokensFromCss]);

  const shadcnTokens = useMemo(
    () => ({
      ...cssBaseShadcn,
      ...shadcnThemeOverrides,
    }),
    [cssBaseShadcn, shadcnThemeOverrides]
  );

  const chartTokens = useMemo(
    () => ({
      ...cssBaseChart,
      ...chartThemeOverrides,
    }),
    [cssBaseChart, chartThemeOverrides]
  );

  const cssProperties = useMemo(
    () =>
      themeOverridesToCssProperties(shadcnThemeOverrides, chartThemeOverrides),
    [chartThemeOverrides, shadcnThemeOverrides]
  );

  const cssBlock = useMemo(() => {
    if (tokenGroup === "chart") {
      return formatBklitChartThemeTokensCss(resolvedTheme, chartTokens);
    }
    return formatBklitShadcnThemeTokensCss(resolvedTheme, shadcnTokens);
  }, [chartTokens, resolvedTheme, shadcnTokens, tokenGroup]);

  const setShadcnToken = useCallback(
    (name: BklitShadcnThemeTokenName, value: string) => {
      setShadcnOverrides((current) => {
        const nextThemeOverrides = {
          ...(current[resolvedTheme] ?? {}),
          [name]: value,
        };
        if (nextThemeOverrides[name] === cssBaseShadcn[name]) {
          delete nextThemeOverrides[name];
        }

        return {
          ...current,
          [resolvedTheme]:
            Object.keys(nextThemeOverrides).length > 0
              ? nextThemeOverrides
              : undefined,
        };
      });
    },
    [cssBaseShadcn, resolvedTheme]
  );

  const setChartToken = useCallback(
    (name: BklitChartThemeTokenName, value: string) => {
      setChartOverrides((current) => {
        const nextThemeOverrides = {
          ...(current[resolvedTheme] ?? {}),
          [name]: value,
        };
        if (nextThemeOverrides[name] === cssBaseChart[name]) {
          delete nextThemeOverrides[name];
        }

        return {
          ...current,
          [resolvedTheme]:
            Object.keys(nextThemeOverrides).length > 0
              ? nextThemeOverrides
              : undefined,
        };
      });
    },
    [cssBaseChart, resolvedTheme]
  );

  const resetTokens = useCallback(() => {
    if (tokenGroup === "chart") {
      setChartOverrides((current) => ({
        ...current,
        [resolvedTheme]: undefined,
      }));
    } else {
      setShadcnOverrides((current) => ({
        ...current,
        [resolvedTheme]: undefined,
      }));
    }

    syncBaseTokensFromCss();
  }, [resolvedTheme, syncBaseTokensFromCss, tokenGroup]);

  const toggleOpen = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggleOpen,
      tokenGroup,
      setTokenGroup,
      resolvedTheme,
      shadcnTokens,
      chartTokens,
      setShadcnToken,
      setChartToken,
      resetTokens,
      cssProperties,
      cssBlock,
    }),
    [
      chartTokens,
      cssBlock,
      cssProperties,
      open,
      resetTokens,
      resolvedTheme,
      setChartToken,
      setShadcnToken,
      shadcnTokens,
      tokenGroup,
      toggleOpen,
    ]
  );

  return (
    <CatalogThemeContext.Provider value={value}>
      <div
        className="flex min-h-[inherit] w-full min-w-0"
        ref={containerRef}
        style={cssProperties}
      >
        {children}
      </div>
    </CatalogThemeContext.Provider>
  );
}

export function useCatalogTheme() {
  const context = useContext(CatalogThemeContext);
  if (!context) {
    throw new Error("useCatalogTheme must be used within CatalogThemeProvider");
  }
  return context;
}
