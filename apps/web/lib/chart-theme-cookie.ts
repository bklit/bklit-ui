import {
  CHART_THEME_COOKIE_MAX_AGE,
  CHART_THEME_COOKIE_NAME,
} from "@/lib/chart-theme-cookie.constants";
import { isValidChartThemeId } from "@/lib/chart-themes";

export function setChartThemeCookie(id: string) {
  const encoded = encodeURIComponent(id);
  // biome-ignore lint/suspicious/noDocumentCookie: lightweight client persistence for chart theme preference
  document.cookie = `${CHART_THEME_COOKIE_NAME}=${encoded}; path=/; max-age=${CHART_THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function getChartThemeIdFromDocumentCookie(): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CHART_THEME_COOKIE_NAME}=([^;]*)`)
  );
  const value = match?.[1];

  if (!value) {
    return null;
  }

  const decoded = decodeURIComponent(value);
  return isValidChartThemeId(decoded) ? decoded : null;
}
