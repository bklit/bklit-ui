import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const monorepoRoot = join(packageRoot, "../..");

const result = spawnSync("pnpm", ["--filter", "@bklitui/studio", "test"], {
  stdio: "inherit",
  cwd: monorepoRoot,
  shell: true,
});

process.exit(result.status ?? 1);
