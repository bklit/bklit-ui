import type { BenchLibraryAdapter, BenchLibraryId } from "../types";
import { bklitAdapter } from "./bklit";
import { rechartsAdapter } from "./recharts";
import { tanstackAdapter } from "./tanstack";

export const BENCH_ADAPTERS: Record<BenchLibraryId, BenchLibraryAdapter> = {
  bklit: bklitAdapter,
  recharts: rechartsAdapter,
  tanstack: tanstackAdapter,
};
