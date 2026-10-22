/**
 * Export the monochrome chart illustrations from /docs/components to static
 * SVGs for the root README chart grid (light + dark variants).
 *
 * The illustrations are React + Tailwind (apps/web/components/illustrations).
 * This script loads the real docs index in headless Chromium, clones each
 * card's illustration panel onto a bare stage, and converts the rendered DOM
 * into plain SVG elements (./readme-illustrations/dom-to-svg.js) — no
 * <foreignObject>, scripts or external resources, so GitHub's camo proxy can
 * serve them as `<img>`. No route is added to the app.
 *
 * Output: apps/web/public/readme/<slug>-light.svg and <slug>-dark.svg
 *
 * Usage (from the repo root):
 *   1. Start the docs dev server (any port):
 *        pnpm --filter web exec next dev --turbopack -p 3950
 *   2. Generate (pass --verify to pixel-compare each SVG, rendered via <img>,
 *      against a screenshot of the live DOM; writes PNGs to the OS tmp dir):
 *        README_ILLUSTRATIONS_BASE_URL=http://localhost:3950 \
 *          node apps/web/scripts/generate-readme-illustrations.mjs --verify
 *
 * Chromium: set CHROME_PATH, otherwise the script tries the Playwright
 * headless shell in ~/.cache/ms-playwright and common Chrome install paths.
 */

import { existsSync, readdirSync } from "node:fs";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outDir = join(scriptDir, "../public/readme");
const serializerPath = join(scriptDir, "readme-illustrations/dom-to-svg.js");

const BASE_URL =
  process.env.README_ILLUSTRATIONS_BASE_URL ?? "http://localhost:3000";
const VERIFY = process.argv.includes("--verify");
/** CSS size of the exported panel (the card's `h-52` height is kept). */
const PANEL_WIDTH = 320;
/** Transparent margin so the card's soft outer shadow isn't cropped. */
const PAD = 4;
/**
 * --verify: a pixel "differs" when no pixel within DIFF_RADIUS device px of
 * the other render is within DIFF_TOLERANCE (0–255 per channel). The radius
 * absorbs Chromium's pixel-snapping of HTML boxes, which the exact SVG
 * geometry doesn't reproduce; missing or miscoloured shapes still fail.
 */
const DIFF_TOLERANCE = 24;
const DIFF_RADIUS = 2;
const MAX_DIFF_RATIO = 0.001;

function resolveChromePath() {
  if (process.env.CHROME_PATH) {
    return process.env.CHROME_PATH;
  }
  const playwrightDir = join(homedir(), ".cache/ms-playwright");
  const candidates = [];
  if (existsSync(playwrightDir)) {
    for (const dir of readdirSync(playwrightDir).sort().reverse()) {
      candidates.push(
        join(
          playwrightDir,
          dir,
          "chrome-headless-shell-linux64/chrome-headless-shell"
        ),
        join(playwrightDir, dir, "chrome-linux/chrome")
      );
    }
  }
  candidates.push(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium"
  );
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    throw new Error("Chromium not found. Set CHROME_PATH.");
  }
  return found;
}

async function openDocsPage(browser, theme) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: theme },
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.evaluateOnNewDocument((t) => {
    localStorage.setItem("theme", t);
  }, theme);
  await page.goto(`${BASE_URL}/docs/components`, {
    waitUntil: "networkidle2",
    timeout: 240_000,
  });
  const isDark = await page.evaluate(() =>
    document.documentElement.classList.contains("dark")
  );
  if (isDark !== (theme === "dark")) {
    throw new Error(`Could not switch the docs page to ${theme} mode`);
  }
  await page.addScriptTag({ path: serializerPath });
  // Move every illustration panel onto a bare, transparent stage so it is
  // rendered as a standalone Card (no CardFrame clipping/radius overrides).
  const slugs = await page.evaluate(
    (width, pad) => {
      const stage = document.createElement("div");
      stage.id = "readme-illustration-stage";
      stage.style.cssText = `display:flex;flex-direction:column;gap:24px;padding:${pad}px;width:${width + pad * 2}px`;
      const found = [];
      for (const frame of document.querySelectorAll(
        '[data-slot="card-frame"]'
      )) {
        const href = frame
          .querySelector('a[href^="/docs/components/"]')
          ?.getAttribute("href");
        const panel = frame.querySelector(':scope > [data-slot="card"]');
        const slug = href?.split("/").at(-1);
        if (!(slug && panel) || found.includes(slug)) {
          continue;
        }
        // Move (not clone): duplicated SVG ids would break gradient refs.
        panel.dataset.readmeSlug = slug;
        panel.style.width = `${width}px`;
        stage.append(panel);
        found.push(slug);
      }
      for (const child of document.body.children) {
        child.style.display = "none";
      }
      document.body.append(stage);
      for (const el of [document.documentElement, document.body]) {
        el.style.background = "transparent";
      }
      return found;
    },
    PANEL_WIDTH,
    PAD
  );
  // Fit the whole stage in the viewport so screenshots never re-layout it.
  const stageHeight = await page.evaluate(
    () =>
      document
        .getElementById("readme-illustration-stage")
        .getBoundingClientRect().height
  );
  await page.setViewport({
    width: 1440,
    height: Math.ceil(stageHeight) + 16,
    deviceScaleFactor: 2,
  });
  await page.evaluate(() => document.fonts.ready);
  return { page, slugs };
}

async function screenshotPanel(page, slug) {
  const clip = await page.evaluate(
    (s, pad) => {
      const r = document
        .querySelector(`[data-readme-slug="${s}"]`)
        .getBoundingClientRect();
      return {
        x: r.left - pad,
        y: r.top + window.scrollY - pad,
        width: r.width + pad * 2,
        height: r.height + pad * 2,
      };
    },
    slug,
    PAD
  );
  return await page.screenshot({
    clip,
    omitBackground: true,
  });
}

/** Render the SVG through <img> and diff it against the DOM screenshot. */
async function compare(browser, svg, domPng, size) {
  const page = await browser.newPage();
  await page.setViewport({
    width: Math.ceil(size.width),
    height: Math.ceil(size.height),
    deviceScaleFactor: 2,
  });
  await page.setContent(
    `<html style="background:transparent"><body style="margin:0;background:transparent"><img id="svg" src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}" width="${size.width}" height="${size.height}" style="display:block"></body></html>`
  );
  await page.waitForFunction(() => document.getElementById("svg").complete);
  const svgPng = await page.screenshot({
    clip: { x: 0, y: 0, width: size.width, height: size.height },
    omitBackground: true,
  });
  const result = await page.evaluate(
    async (a, b, tolerance, radius) => {
      const load = (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = `data:image/png;base64,${src}`;
        });
      const [imgA, imgB] = await Promise.all([load(a), load(b)]);
      const w = Math.min(imgA.width, imgB.width);
      const h = Math.min(imgA.height, imgB.height);
      const pixels = (img) => {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, w, h).data;
      };
      const pa = pixels(imgA);
      const pb = pixels(imgB);
      const delta = (i, j) =>
        Math.max(
          Math.abs(pa[i] - pb[j]),
          Math.abs(pa[i + 1] - pb[j + 1]),
          Math.abs(pa[i + 2] - pb[j + 2]),
          Math.abs(pa[i + 3] - pb[j + 3])
        );
      /** Best match within ±r device px — absorbs pixel-snapping shifts. */
      const nearest = (x, y) => {
        let best = 255;
        for (let dy = -radius; dy <= radius && best > tolerance; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < w && ny < h) {
              best = Math.min(best, delta((y * w + x) * 4, (ny * w + nx) * 4));
            }
          }
        }
        return best;
      };
      let strict = 0;
      let shifted = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          if (delta(i, i) > tolerance) {
            strict++;
            if (nearest(x, y) > tolerance) {
              shifted++;
            }
          }
        }
      }
      return { strict: strict / (w * h), ratio: shifted / (w * h) };
    },
    Buffer.from(domPng).toString("base64"),
    Buffer.from(svgPng).toString("base64"),
    DIFF_TOLERANCE,
    DIFF_RADIUS
  );
  await page.close();
  return { ...result, svgPng };
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const verifyDir = VERIFY
    ? await mkdtemp(join(tmpdir(), "readme-illustrations-"))
    : null;
  const browser = await puppeteer.launch({
    executablePath: resolveChromePath(),
    args: ["--no-sandbox"],
  });
  let failed = false;
  try {
    for (const theme of ["light", "dark"]) {
      const { page, slugs } = await openDocsPage(browser, theme);
      if (slugs.length === 0) {
        throw new Error("No illustration cards found on /docs/components");
      }
      for (const slug of slugs) {
        const { svg, warnings, width, height } = await page.evaluate(
          (s, pad) =>
            window.__bklitDomToSvg(
              document.querySelector(`[data-readme-slug="${s}"]`),
              pad
            ),
          slug,
          PAD
        );
        const file = join(outDir, `${slug}-${theme}.svg`);
        await writeFile(file, `${svg}\n`);
        let line = `${slug}-${theme}.svg  ${(svg.length / 1024).toFixed(1)} KB`;
        if (warnings.length > 0) {
          failed = true;
          line += `\n  warnings:\n    ${[...new Set(warnings)].join("\n    ")}`;
        }
        if (verifyDir) {
          const domPng = await screenshotPanel(page, slug);
          const diff = await compare(browser, svg, domPng, { width, height });
          await writeFile(join(verifyDir, `${slug}-${theme}-dom.png`), domPng);
          await writeFile(
            join(verifyDir, `${slug}-${theme}-svg.png`),
            diff.svgPng
          );
          const ok = diff.ratio <= MAX_DIFF_RATIO;
          failed ||= !ok;
          line += `  diff ${(diff.ratio * 100).toFixed(3)}% (exact-pixel ${(diff.strict * 100).toFixed(2)}%)${ok ? "" : "  FAIL"}`;
        }
        console.log(line);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
  if (verifyDir) {
    console.log(`\nVerification PNGs: ${verifyDir}`);
  }
  if (failed) {
    console.error("\nSome illustrations did not convert faithfully.");
    process.exit(1);
  }
}

await main();
