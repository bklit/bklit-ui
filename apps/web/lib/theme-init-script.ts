/** Runs before paint so iframe embeds match the parent site theme. */
export const themeInitScript = `
(function () {
  try {
    var params = new URLSearchParams(window.location.search);
    var theme = params.get("theme");
    if (theme !== "dark" && theme !== "light") {
      theme = localStorage.getItem("theme");
    }
    if (theme === "system" || !theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    var root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  } catch (e) {}
})();
`.trim();
