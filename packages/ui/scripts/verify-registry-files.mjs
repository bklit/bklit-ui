#!/usr/bin/env node
/**
 * Verifies every installable registry item ships all local `./` imports in its
 * transitive file closure (item files + registryDependencies).
 *
 * Also rejects CommonJS `require("react-dom")` in registry source files — it
 * breaks Vite/ESM consumers even though Next.js/webpack may tolerate it.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uiRoot = path.join(__dirname, "..");
const registryPath = path.join(uiRoot, "registry.json");

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const byName = Object.fromEntries(
  registry.items.map((item) => [item.name, item])
);

const importRe =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"]+\s+from\s+)?['"](\.[^'"]+)['"]/g;
const BKLIT_REGISTRY_DEP_RE = /^@bklit\/(.+)$/;

const RESOLVE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

function resolveRelativeImport(fromFilePath, spec) {
  const dir = path.dirname(fromFilePath);
  const base = path.normalize(path.join(dir, spec));
  const candidates = [
    base,
    ...RESOLVE_EXTENSIONS.map((ext) => base + ext),
    ...RESOLVE_EXTENSIONS.map((ext) => path.join(base, `index${ext}`)),
  ];

  for (const candidate of candidates) {
    const fullPath = path.join(uiRoot, candidate);
    if (fs.existsSync(fullPath)) {
      return candidate;
    }
  }

  return null;
}

function collectItemFiles(itemName, visited = new Set()) {
  const files = new Set();
  const visit = (name) => {
    if (visited.has(name)) {
      return;
    }
    visited.add(name);
    const item = byName[name];
    if (!item) {
      return;
    }
    for (const file of item.files ?? []) {
      files.add(file.path);
    }
    for (const regDep of item.registryDependencies ?? []) {
      const nested = regDep.match(BKLIT_REGISTRY_DEP_RE)?.[1];
      if (nested) {
        visit(nested);
      }
    }
  };
  visit(itemName);
  return files;
}

function scanRelativeImports(filePath) {
  // v0/shadcn example barrels re-export co-installed chart files from the
  // target `components/charts/` directory — not from registry source paths.
  if (
    filePath.startsWith("registry/examples/") &&
    filePath.endsWith("-index.ts")
  ) {
    return { imports: [], content: "" };
  }

  const fullPath = path.join(uiRoot, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Registry file not found: ${filePath}`);
  }
  const content = fs.readFileSync(fullPath, "utf8");
  const imports = [];
  importRe.lastIndex = 0;
  let match = importRe.exec(content);
  while (match) {
    imports.push(match[1]);
    match = importRe.exec(content);
  }
  return { imports, content };
}

const INSTALLABLE_TYPES = new Set([
  "registry:component",
  "registry:lib",
  "registry:block",
]);

const installableItems = registry.items.filter((item) =>
  INSTALLABLE_TYPES.has(item.type)
);

const closureFailures = [];
const requireFailures = [];

for (const item of installableItems) {
  const closure = collectItemFiles(item.name);
  const missing = new Map();

  for (const filePath of closure) {
    const { imports, content } = scanRelativeImports(filePath);

    if (content.includes('require("react-dom")')) {
      requireFailures.push({ item: item.name, file: filePath });
    }

    for (const spec of imports) {
      const resolved = resolveRelativeImport(filePath, spec);
      if (!resolved) {
        const key = `${filePath} -> ${spec}`;
        if (!missing.has(key)) {
          missing.set(key, "missing on disk");
        }
        continue;
      }
      if (!closure.has(resolved)) {
        const key = `${filePath} -> ${spec} (${resolved})`;
        if (!missing.has(key)) {
          missing.set(key, "not in install closure");
        }
      }
    }
  }

  if (missing.size > 0) {
    closureFailures.push({ name: item.name, missing: [...missing.entries()] });
  }
}

let failed = false;

if (closureFailures.length > 0) {
  failed = true;
  console.error("Registry local import closure check failed:\n");
  for (const { name, missing } of closureFailures) {
    console.error(`  ${name}:`);
    for (const [ref, reason] of missing) {
      console.error(`    - ${ref} (${reason})`);
    }
    console.error("");
  }
  console.error(
    "Add missing files to packages/ui/registry.json (on the item or a registryDependency)."
  );
}

if (requireFailures.length > 0) {
  failed = true;
  console.error('Registry source must not use require("react-dom"):\n');
  for (const { item, file } of requireFailures) {
    console.error(`  ${item}: ${file}`);
  }
  console.error(
    '\nUse `import { createPortal } from "react-dom"` in "use client" components instead.'
  );
}

if (failed) {
  process.exit(1);
}

console.log(
  `Registry file closure OK (${installableItems.length} installable items checked).`
);
