import chromium from "@sparticuz/chromium-min";
import puppeteer, { type Browser } from "puppeteer-core";

const CHROMIUM_PACK_URL =
  process.env.STUDIO_OG_CHROMIUM_PACK_URL ??
  "https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar";

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

function shouldUseLocalChrome(): boolean {
  return process.env.NODE_ENV === "development" || process.env.VERCEL !== "1";
}

async function resolveServerlessChromiumPath(): Promise<string> {
  return await chromium.executablePath(CHROMIUM_PACK_URL);
}

export async function launchStudioOgBrowser(): Promise<Browser> {
  const localChrome = shouldUseLocalChrome();

  if (!localChrome) {
    chromium.setGraphicsMode = false;
  }

  const chromiumArgs: string[] = localChrome
    ? await Promise.resolve(puppeteer.defaultArgs())
    : await Promise.resolve(chromium.args);

  return puppeteer.launch({
    args: chromiumArgs,
    defaultViewport: {
      width: 1200,
      height: 800,
      deviceScaleFactor: 2,
    },
    executablePath: localChrome
      ? await resolveLocalChromePath()
      : await resolveServerlessChromiumPath(),
    headless: true,
  });
}
