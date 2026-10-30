import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";
import type {
  BaselineBenchmark,
  BaselineFile,
  BaselineStepRecord,
} from "../bench/baseline";
import { isLabChartSlug, VARIANT_ID_PATTERN } from "../lab-slugs";

/**
 * Dev-only read/write access to the lab's golden baselines
 * (`_baselines/<chart>/<variant>.json`, committed). Refuses everything
 * unless `NODE_ENV === "development"` (so never on Vercel), validates chart
 * and variant against the lab's slugs and keeps every path inside
 * `_baselines/`.
 *
 * GET  ?chart=&variant=   one baseline (404 when missing)
 * GET  ?index=1           { [chart]: variantId[] } of recorded baselines
 * POST { action: "geometry", baseline }                 write geometry (keeps
 *                                                        stored benchmark)
 * POST { action: "benchmark", chart, variant, benchmark } set benchmark medians
 */

export const dynamic = "force-dynamic";

const BASELINE_DIR = path.join(
  process.cwd(),
  "app",
  "(dev)",
  "lab",
  "visx-to-d3",
  "_baselines"
);

const MAX_BODY_BYTES = 32 * 1024 * 1024;

function devOnly(): NextResponse | null {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Baselines are only available in next dev" },
      { status: 404 }
    );
  }
  return null;
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Validated absolute path of a baseline file, or `null`. */
function baselinePath(chart: unknown, variant: unknown): string | null {
  if (!isLabChartSlug(chart)) {
    return null;
  }
  if (typeof variant !== "string" || !VARIANT_ID_PATTERN.test(variant)) {
    return null;
  }
  const file = path.resolve(BASELINE_DIR, chart, `${variant}.json`);
  return file.startsWith(`${BASELINE_DIR}${path.sep}`) ? file : null;
}

async function readBaseline(file: string): Promise<BaselineFile | null> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as BaselineFile;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function machineLabel(): string {
  const cpus = os.cpus();
  return `${os.hostname()} · ${cpus[0]?.model.trim() ?? "unknown CPU"} × ${cpus.length}`;
}

/**
 * Pretty JSON with one geometry node per line: small, stable git diffs
 * without spreading every attribute over its own line.
 */
function formatBaseline(file: BaselineFile): string {
  const blocks: string[] = [];
  const marker = (nodes: unknown[]) => {
    blocks.push(
      nodes.length === 0
        ? "[]"
        : `[\n${nodes.map((node) => `        ${JSON.stringify(node)}`).join(",\n")}\n      ]`
    );
    return `__NODES_${blocks.length - 1}__`;
  };
  const steps = file.steps.map((step: BaselineStepRecord) => ({
    ...step,
    ...(step.nodes ? { nodes: marker(step.nodes) } : {}),
    ...(step.changed ? { changed: marker(step.changed) } : {}),
  }));
  const json = JSON.stringify({ ...file, steps }, null, 2);
  return `${json.replace(/"__NODES_(\d+)__"/g, (_, i: string) => blocks[Number(i)] ?? "[]")}\n`;
}

function isBaselineFile(value: unknown): value is BaselineFile {
  const file = value as Partial<BaselineFile> | null;
  return (
    typeof file === "object" &&
    file !== null &&
    file.schema === 1 &&
    typeof file.chart === "string" &&
    typeof file.variant === "string" &&
    Array.isArray(file.steps) &&
    file.steps.length > 0
  );
}

export async function GET(request: Request) {
  const refused = devOnly();
  if (refused) {
    return refused;
  }
  const params = new URL(request.url).searchParams;
  if (params.get("index")) {
    const index: Record<string, string[]> = {};
    const charts = await readdir(BASELINE_DIR).catch(() => [] as string[]);
    for (const chart of charts.filter(isLabChartSlug)) {
      const files = await readdir(path.join(BASELINE_DIR, chart));
      index[chart] = files
        .filter((name) => name.endsWith(".json"))
        .map((name) => name.slice(0, -".json".length))
        .filter((id) => VARIANT_ID_PATTERN.test(id))
        .sort();
    }
    return NextResponse.json(index);
  }
  const file = baselinePath(params.get("chart"), params.get("variant"));
  if (!file) {
    return bad("Unknown chart or invalid variant id");
  }
  const baseline = await readBaseline(file);
  return baseline
    ? NextResponse.json(baseline)
    : NextResponse.json({ error: "No baseline" }, { status: 404 });
}

export async function POST(request: Request) {
  const refused = devOnly();
  if (refused) {
    return refused;
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return bad("Body too large", 413);
  }
  let body: {
    action?: string;
    baseline?: unknown;
    chart?: unknown;
    variant?: unknown;
    benchmark?: BaselineBenchmark;
  };
  try {
    body = await request.json();
  } catch {
    return bad("Invalid JSON");
  }

  if (body.action === "geometry") {
    if (!isBaselineFile(body.baseline)) {
      return bad("Invalid baseline");
    }
    const incoming = body.baseline;
    const file = baselinePath(incoming.chart, incoming.variant);
    if (!file) {
      return bad("Unknown chart or invalid variant id");
    }
    const existing = await readBaseline(file);
    const baseline: BaselineFile = {
      ...incoming,
      machine: `${machineLabel()} · ${incoming.machine}`,
      ...(existing?.benchmark ? { benchmark: existing.benchmark } : {}),
    };
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, formatBaseline(baseline));
    return NextResponse.json({
      ok: true,
      path: path.relative(process.cwd(), file),
    });
  }

  if (body.action === "benchmark") {
    const file = baselinePath(body.chart, body.variant);
    if (!file) {
      return bad("Unknown chart or invalid variant id");
    }
    const existing = await readBaseline(file);
    if (!existing) {
      return bad("Record the geometry baseline first", 409);
    }
    const benchmark = body.benchmark;
    if (!(benchmark && typeof benchmark.medians === "object")) {
      return bad("Invalid benchmark");
    }
    await writeFile(
      file,
      formatBaseline({
        ...existing,
        benchmark: {
          ...benchmark,
          machine: `${machineLabel()} · ${benchmark.machine}`,
        },
      })
    );
    return NextResponse.json({ ok: true });
  }

  return bad("Unknown action");
}
