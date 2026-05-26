#!/usr/bin/env node
/**
 * Ensures shadcn registry output matches chart source when packages/ui/src/charts changes.
 * Run via `pnpm registry:verify` (locally or in CI).
 */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../../..");

const CHARTS_SRC = "packages/ui/src/charts";
const REGISTRY_PATHS = [
  "apps/web/public/r",
  "packages/ui/registry.json",
  "packages/ui/registry/examples",
  "packages/ui/registry/blocks",
];

function run(cmd, { inherit = false } = {}) {
  return execSync(cmd, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: inherit ? "inherit" : "pipe",
  });
}

function resolveDiffRange() {
  if (process.env.REGISTRY_SYNC_DIFF_RANGE) {
    return process.env.REGISTRY_SYNC_DIFF_RANGE;
  }

  if (process.env.GITHUB_EVENT_NAME === "pull_request") {
    const base = process.env.GITHUB_BASE_REF || "main";
    return `origin/${base}...HEAD`;
  }

  if (
    process.env.GITHUB_EVENT_NAME === "push" &&
    process.env.GITHUB_EVENT_BEFORE &&
    process.env.GITHUB_SHA
  ) {
    return `${process.env.GITHUB_EVENT_BEFORE}...${process.env.GITHUB_SHA}`;
  }

  return "origin/main...HEAD";
}

function chartsChanged(diffRange) {
  const changed = run(
    `git diff --name-only ${diffRange} -- ${CHARTS_SRC}`
  ).trim();
  return changed.length > 0;
}

function listDirtyRegistryFiles() {
  const paths = REGISTRY_PATHS.join(" ");
  const status = run(`git status --porcelain -- ${paths}`).trim();
  if (!status) {
    return [];
  }
  return status.split("\n").filter(Boolean);
}

function main() {
  const diffRange = resolveDiffRange();

  if (!chartsChanged(diffRange)) {
    console.log(
      `No changes in ${CHARTS_SRC} (${diffRange}); registry sync check skipped.`
    );
    process.exit(0);
  }

  console.log(
    `Chart source changed (${diffRange}); rebuilding registry to verify sync...`
  );
  run("pnpm registry:build", { inherit: true });

  const dirty = listDirtyRegistryFiles();
  if (dirty.length > 0) {
    console.error("\nRegistry is out of sync with chart source changes.\n");
    console.error(
      "Run `pnpm registry:build` from the repo root and commit the updated registry files:\n"
    );
    for (const line of dirty) {
      console.error(`  ${line}`);
    }
    process.exit(1);
  }

  console.log("Registry is in sync with chart source.");
}

main();
