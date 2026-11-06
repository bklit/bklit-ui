import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  isUnknownTopLevelPath,
  KNOWN_TOP_LEVEL_SEGMENTS,
  prefersMarkdown,
} from "../markdown-negotiation";

test("prefersMarkdown: explicit text/markdown wins over HTML", () => {
  assert.equal(prefersMarkdown("text/markdown"), true);
  assert.equal(prefersMarkdown("text/markdown, text/html;q=0.9"), true);
  assert.equal(prefersMarkdown("text/html;q=0.5, text/markdown"), true);
  assert.equal(prefersMarkdown("text/markdown, text/html"), true);
  assert.equal(prefersMarkdown("TEXT/Markdown; charset=utf-8"), true);
  assert.equal(prefersMarkdown("text/markdown, */*;q=0.1"), true);
});

test("prefersMarkdown: browsers, curl, and HTML-first clients get HTML", () => {
  assert.equal(prefersMarkdown(null), false);
  assert.equal(prefersMarkdown(""), false);
  assert.equal(prefersMarkdown("*/*"), false);
  assert.equal(prefersMarkdown("text/*"), false);
  assert.equal(prefersMarkdown("text/html"), false);
  assert.equal(
    prefersMarkdown(
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    ),
    false
  );
  assert.equal(prefersMarkdown("text/html, text/markdown;q=0.5"), false);
  assert.equal(prefersMarkdown("text/markdown;q=0"), false);
});

test("isUnknownTopLevelPath", () => {
  assert.equal(isUnknownTopLevelPath("/"), false);
  assert.equal(isUnknownTopLevelPath("/docs/installation"), false);
  assert.equal(isUnknownTopLevelPath("/charts/does-not-exist"), false);
  assert.equal(isUnknownTopLevelPath("/__ora-404-probe-vkqk2fjn"), true);
  assert.equal(isUnknownTopLevelPath("/nope/deeper"), true);
  assert.equal(isUnknownTopLevelPath("/%E0%A4%A"), true);
});

test("KNOWN_TOP_LEVEL_SEGMENTS covers every app/ route and public/ entry", () => {
  const webRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
  const appDir = join(webRoot, "app");
  const segments = new Set<string>();

  const collect = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (!statSync(full).isDirectory()) {
        continue;
      }
      if (name.startsWith("(") && name.endsWith(")")) {
        collect(full); // route groups don't add a URL segment
      } else if (!(name.startsWith("_") || name === "fonts")) {
        segments.add(name);
      }
    }
  };
  collect(appDir);
  for (const name of readdirSync(join(webRoot, "public"))) {
    segments.add(name);
  }

  const missing = [...segments].filter(
    (segment) => !KNOWN_TOP_LEVEL_SEGMENTS.has(segment)
  );
  assert.deepEqual(
    missing,
    [],
    "add new top-level routes to KNOWN_TOP_LEVEL_SEGMENTS"
  );
});
