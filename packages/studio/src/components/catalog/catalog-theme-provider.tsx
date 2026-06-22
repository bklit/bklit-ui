"use client";

import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  BKLIT_CHART_THEME_TOKEN_DEFAULTS,
  type BklitChartThemeTokenName,
  type BklitChartThemeTokens,
  bklitChartThemeTokensToCssProperties,
  formatBklitChartThemeTokensCss,
  resolveBklitChartThemeTokens,
} from "@/lib/bklit-chart-theme-tokens";
import {
  BKLIT_SHADCN_THEME_TOKEN_DEFAULTS,
  type BklitShadcnThemeTokenName,
  type BklitShadcnThemeTokens,
  type BklitThemeMode,
  bklitShadcnThemeTokensToCssProperties,
  formatBklitShadcnThemeTokensCss,
  resolveBklitShadcnThemeTokens,
} from "@/lib/bklit-shadcn-theme-tokens";
import { useStudioTheme } from "@/providers/studio-theme-provider";

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
  cssProperties: CSSProperties;
  cssBlock: string;
}

const CatalogThemeContext = createContext<CatalogThemeContextValue | null>(
  null
);

export function CatalogThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useStudioTheme();
  const [open, setOpen] = useState(true);
  const [tokenGroup, setTokenGroup] =
    useState<CatalogThemeTokenGroup>("shadcn");
  const [shadcnOverrides, setShadcnOverrides] = useState<
    Partial<Record<BklitThemeMode, Partial<BklitShadcnThemeTokens>>>
  >({});
  const [chartOverrides, setChartOverrides] = useState<
    Partial<Record<BklitThemeMode, Partial<BklitChartThemeTokens>>>
  >({});

  const shadcnThemeOverrides = shadcnOverrides[resolvedTheme] ?? {};
  const chartThemeOverrides = chartOverrides[resolvedTheme] ?? {};

  const shadcnTokens = useMemo(
    () => resolveBklitShadcnThemeTokens(resolvedTheme, shadcnThemeOverrides),
    [resolvedTheme, shadcnThemeOverrides]
  );

  const chartTokens = useMemo(
    () => resolveBklitChartThemeTokens(resolvedTheme, chartThemeOverrides),
    [resolvedTheme, chartThemeOverrides]
  );

  const cssProperties = useMemo(
    () =>
      ({
        ...bklitShadcnThemeTokensToCssProperties(shadcnTokens),
        ...bklitChartThemeTokensToCssProperties(chartTokens),
      }) as CSSProperties,
    [chartTokens, shadcnTokens]
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
        const defaults = BKLIT_SHADCN_THEME_TOKEN_DEFAULTS[resolvedTheme];
        if (nextThemeOverrides[name] === defaults[name]) {
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
    [resolvedTheme]
  );

  const setChartToken = useCallback(
    (name: BklitChartThemeTokenName, value: string) => {
      setChartOverrides((current) => {
        const nextThemeOverrides = {
          ...(current[resolvedTheme] ?? {}),
          [name]: value,
        };
        const defaults = BKLIT_CHART_THEME_TOKEN_DEFAULTS[resolvedTheme];
        if (nextThemeOverrides[name] === defaults[name]) {
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
    [resolvedTheme]
  );

  const resetTokens = useCallback(() => {
    if (tokenGroup === "chart") {
      setChartOverrides((current) => ({
        ...current,
        [resolvedTheme]: undefined,
      }));
      return;
    }

    setShadcnOverrides((current) => ({
      ...current,
      [resolvedTheme]: undefined,
    }));
  }, [resolvedTheme, tokenGroup]);

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
