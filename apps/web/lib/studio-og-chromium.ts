import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";

const LOCAL_CHROME_PATHS = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
].filter((path): path is string => Boolean(path));

async function resolveLocalChromePath(): Promise<string> {
  const { access } = await import("node:fs/promises");
  for (const path of LOCAL_CHROME_PATHS) {
    try {
      await access(path);
      return path;
    } catch {
      // try next candidate
    }
  }
  throw new Error(
    "Local Chrome not found for OG screenshots. Set CHROME_PATH or install Google Chrome."
  );
}

export async function launchStudioOgBrowser(): Promise<Browser> {
  const isDev = process.env.NODE_ENV === "development";

  const chromiumArgs: string[] = isDev
    ? await Promise.resolve(puppeteer.defaultArgs())
    : await Promise.resolve(chromium.args);

  return puppeteer.launch({
    args: chromiumArgs,
    defaultViewport: {
      width: 1200,
      height: 800,
      deviceScaleFactor: 2,
    },
    executablePath: isDev
      ? await resolveLocalChromePath()
      : await chromium.executablePath(),
    headless: true,
  });
}
