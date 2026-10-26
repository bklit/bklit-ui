import { CHART_THEME_COOKIE_NAME } from "@/lib/chart-theme-cookie.constants";
import {
  CHART_THEME_VAR_NAMES,
  CHART_THEMES_SCRIPT_DATA,
  CUSTOM_CHART_THEME_ID,
  CUSTOM_CHART_THEME_STORAGE_KEY,
  DEFAULT_CHART_THEME_ID,
} from "@/lib/chart-themes";

function buildChartThemeScript() {
  const themesJson = JSON.stringify(CHART_THEMES_SCRIPT_DATA);
  const defaultId = JSON.stringify(DEFAULT_CHART_THEME_ID);
  const cookieName = JSON.stringify(CHART_THEME_COOKIE_NAME);
  const customId = JSON.stringify(CUSTOM_CHART_THEME_ID);
  const customStorageKey = JSON.stringify(CUSTOM_CHART_THEME_STORAGE_KEY);
  const varNames = JSON.stringify(CHART_THEME_VAR_NAMES);

  return `(function () {
  var themes = ${themesJson};
  var defaultId = ${defaultId};
  var cookieName = ${cookieName};
  var customId = ${customId};
  var customStorageKey = ${customStorageKey};
  var names = ${varNames};

  function readCookieThemeId() {
    var match = document.cookie.match(new RegExp("(?:^|; )" + cookieName + "=([^;]*)"));
    if (!match) return null;
    try {
      return decodeURIComponent(match[1]);
    } catch (e) {
      return match[1];
    }
  }

  function resolveMode() {
    var root = document.documentElement;
    if (root.classList.contains("dark")) return "dark";
    try {
      var storedTheme = localStorage.getItem("theme");
      if (storedTheme === "dark") return "dark";
      if (storedTheme === "light") return "light";
      // next-themes defaultTheme is "system" (no stored value).
      if (
        (storedTheme === "system" || !storedTheme) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "dark";
      }
    } catch (e) {}
    return "light";
  }

  function applyVars(element, vars) {
    for (var i = 0; i < names.length; i++) {
      var value = vars[names[i]];
      if (typeof value === "string" && value) {
        element.style.setProperty("--" + names[i], value);
      }
    }
  }

  function readCustomTheme() {
    try {
      var parsed = JSON.parse(localStorage.getItem(customStorageKey) || "null");
      if (parsed && parsed.light && parsed.dark) {
        return { id: customId, light: parsed.light, dark: parsed.dark };
      }
    } catch (e) {}
    return null;
  }

  function findTheme(id) {
    for (var i = 0; i < themes.length; i++) {
      if (themes[i].id === id) return themes[i];
    }
    return null;
  }

  var themeId = readCookieThemeId() || defaultId;
  var theme =
    (themeId === customId ? readCustomTheme() : findTheme(themeId)) ||
    findTheme(defaultId);
  if (!theme) return;

  var mode = resolveMode();
  applyVars(document.documentElement, mode === "dark" ? theme.dark : theme.light);
})();`;
}

/**
 * Applies the saved chart palette's CSS variables to `<html>` before first
 * paint. Render it inside `<head>`.
 *
 * A plain inline `<script>` (the next-themes pattern), not `next/script`:
 * in the App Router, `next/script` `beforeInteractive` inline scripts are
 * queued on `self.__next_s` and only run once Next's client JS has loaded, so
 * the page painted with the default palette first. As a parser-blocking
 * inline script in `<head>` it runs before the body renders, which is also
 * what lets the page be static: the palette never has to be server-rendered.
 */
export function ChartThemeScript() {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: palette bootstrap before first paint
      dangerouslySetInnerHTML={{ __html: buildChartThemeScript() }}
      id="bklit-chart-theme"
    />
  );
}
