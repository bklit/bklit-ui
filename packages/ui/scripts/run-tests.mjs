import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const testDir = join(packageRoot, "src/charts/__tests__");

const tests = readdirSync(testDir)
  .filter((name) => name.endsWith(".test.ts"))
  .map((name) => join(testDir, name));

if (tests.length === 0) {
  console.error(`No test files found in ${testDir}`);
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...tests],
  { stdio: "inherit", cwd: packageRoot }
);

process.exit(result.status ?? 1);
