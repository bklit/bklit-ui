import {
  resolveYAxisTickCount,
  Y_AXIS_DEFAULT_TICK_COUNT,
} from "@bklitui/ui/charts";
import type { LineYAxisId } from "@/lib/line-series-y-axis";
import type { StudioUrlState } from "@/lib/studio-parsers";
import { parsePipeField, serializePipeField } from "@/lib/studio-series-design";

const Y_AXIS_SLOT_COUNT = 2;

function yAxisSlotIndex(axis: LineYAxisId): number {
  return axis === "right" ? 1 : 0;
}

function readPipeSlot(values: string[], index: number): string | undefined {
  return values[index] ?? values[0];
}

export function getLineYAxisNumTicks(
  state: StudioUrlState,
  axis: LineYAxisId
): number {
  const parts = parsePipeField(state.lineYAxisNumTicks);
  const raw = Number(readPipeSlot(parts, yAxisSlotIndex(axis)));
  return resolveYAxisTickCount(raw);
}

export function buildLineYAxisNumTicksUpdate(
  state: StudioUrlState,
  axis: LineYAxisId,
  numTicks: number
): string {
  const current = parsePipeField(state.lineYAxisNumTicks);
  const next = Array.from({ length: Y_AXIS_SLOT_COUNT }, (_, index) => {
    const existing = Number(readPipeSlot(current, index));
    const value = Number.isFinite(existing)
      ? existing
      : Y_AXIS_DEFAULT_TICK_COUNT;
    const nextValue =
      index === yAxisSlotIndex(axis)
        ? resolveYAxisTickCount(numTicks)
        : resolveYAxisTickCount(value);
    return String(nextValue);
  });
  return serializePipeField(next);
}

export function getLineYAxisFormatLargeNumbers(
  state: StudioUrlState,
  axis: LineYAxisId
): boolean {
  const parts = parsePipeField(state.lineYAxisFormatLarge);
  const raw = readPipeSlot(parts, yAxisSlotIndex(axis)) ?? "1";
  return raw !== "0" && raw !== "false";
}

export function buildLineYAxisFormatLargeUpdate(
  state: StudioUrlState,
  axis: LineYAxisId,
  formatLargeNumbers: boolean
): string {
  const current = parsePipeField(state.lineYAxisFormatLarge);
  const next = Array.from({ length: Y_AXIS_SLOT_COUNT }, (_, index) => {
    const raw = readPipeSlot(current, index) ?? "1";
    const existing = raw !== "0" && raw !== "false";
    const slotValue =
      index === yAxisSlotIndex(axis) ? formatLargeNumbers : existing;
    return slotValue ? "1" : "0";
  });
  return serializePipeField(next);
}
