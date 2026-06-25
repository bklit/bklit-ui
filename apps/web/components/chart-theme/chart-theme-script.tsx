import Script from "next/script";
import { CHART_THEME_COOKIE_NAME } from "@/lib/chart-theme-cookie.constants";
import {
  CHART_THEMES_SCRIPT_DATA,
  DEFAULT_CHART_THEME_ID,
} from "@/lib/chart-themes";

function buildChartThemeScript() {
  const themesJson = JSON.stringify(CHART_THEMES_SCRIPT_DATA);
  const defaultId = JSON.stringify(DEFAULT_CHART_THEME_ID);
  const cookieName = JSON.stringify(CHART_THEME_COOKIE_NAME);

  return `(function () {
  var themes = ${themesJson};
  var defaultId = ${defaultId};
  var cookieName = ${cookieName};

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
      if (
        storedTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "dark";
      }
    } catch (e) {}
    return "light";
  }

  function applyVars(element, vars, clearOverrides) {
    var names = [
      "chart-1",
      "chart-2",
      "chart-3",
      "chart-4",
      "chart-5",
      "chart-scale-01",
      "chart-scale-02",
      "chart-scale-03",
      "chart-scale-04",
      "chart-scale-05",
    ];
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      var value = vars[name];
      if (clearOverrides || value === undefined) {
        element.style.removeProperty("--" + name);
      } else {
        element.style.setProperty("--" + name, value);
      }
    }
  }

  var themeId = readCookieThemeId() || defaultId;
  var theme = themes.find(function (t) { return t.id === themeId; }) || themes[0];
  if (!theme) return;

  var mode = resolveMode();
  var vars = mode === "dark" ? theme.dark : theme.light;
  var clearOverrides =
    Object.keys(theme.light).length === 0 && Object.keys(theme.dark).length === 0;

  applyVars(document.documentElement, vars, clearOverrides);
})();`;
}

export function ChartThemeScript() {
  return (
    <Script id="bklit-chart-theme" strategy="beforeInteractive">
      {buildChartThemeScript()}
    </Script>
  );
}
