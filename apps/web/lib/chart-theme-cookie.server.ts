import "server-only";

import { cookies } from "next/headers";
import { CHART_THEME_COOKIE_NAME } from "@/lib/chart-theme-cookie.constants";
import {
  DEFAULT_CHART_THEME_ID,
  isValidChartThemeId,
} from "@/lib/chart-themes";

export async function getChartThemeIdFromCookie(): Promise<string> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CHART_THEME_COOKIE_NAME)?.value;

  if (value && isValidChartThemeId(value)) {
    return value;
  }

  return DEFAULT_CHART_THEME_ID;
}
