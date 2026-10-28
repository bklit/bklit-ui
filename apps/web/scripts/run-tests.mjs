import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const monorepoRoot = join(packageRoot, "../..");
const TEST_FILE = /(^|[\\/])__tests__[\\/][^\\/]+\.test\.ts$/;

const studio = spawnSync("pnpm", ["--filter", "@bklitui/studio", "test"], {
  stdio: "inherit",
  cwd: monorepoRoot,
  shell: true,
});

if (studio.status !== 0) {
  process.exit(studio.status ?? 1);
}

// apps/web's own pure-helper tests: lib/**/__tests__/*.test.ts
const tests = readdirSync(join(packageRoot, "lib"), { recursive: true })
  .map(String)
  .filter((path) => TEST_FILE.test(path))
  .map((path) => join(packageRoot, "lib", path));

if (tests.length === 0) {
  process.exit(0);
}

const web = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...tests],
  { stdio: "inherit", cwd: packageRoot }
);

process.exit(web.status ?? 1);
