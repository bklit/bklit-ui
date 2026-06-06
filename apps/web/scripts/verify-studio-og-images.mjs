/**
 * Verify Studio OG chart + card routes for every chart slug.
 *
 * Prerequisites:
 *   - `pnpm dev` running in apps/web (default http://localhost:3000)
 *   - Google Chrome installed (Puppeteer screenshot route)
 *
 * Usage:
 *   node apps/web/scripts/verify-studio-og-images.mjs
 *   STUDIO_OG_BASE_URL=http://127.0.0.1:3000 node apps/web/scripts/verify-studio-og-images.mjs
 */

import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const monorepoRoot = join(packageRoot, "../..");

const result = spawnSync(
  "pnpm",
  [
    "--filter",
    "@bklitui/studio",
    "exec",
    "node",
    "--import",
    "tsx",
    "--test",
    "src/lib/__tests__/studio-og.test.ts",
  ],
  {
    stdio: "inherit",
    cwd: monorepoRoot,
    shell: true,
    env: {
      ...process.env,
      STUDIO_OG_INTEGRATION: "1",
      STUDIO_OG_BASE_URL:
        process.env.STUDIO_OG_BASE_URL ?? "http://localhost:3000",
    },
  }
);

process.exit(result.status ?? 1);
