import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { RANGE_DAYS, type RangeOption } from "./data";

export type CrosshairStyle = "Gradient" | "Dashed";

interface DemoState {
  range: RangeOption;
  days: number;
  seed: number;
  /** Bumps to remount charts and replay the reveal. */
  replayKey: number;
  crosshair: CrosshairStyle;
  indicatorDasharray: [number, number] | undefined;
  setRange: (r: RangeOption) => void;
  setCrosshair: (c: CrosshairStyle) => void;
  shuffle: () => void;
  replay: () => void;
}

const DemoContext = createContext<DemoState | null>(null);

/**
 * Demo controls shared by both tabs and the bottom accessory. Lives above
 * `NativeTabs` because iOS renders the accessory twice (regular + inline).
 */
export function DemoProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useState<RangeOption>("4W");
  const [seed, setSeed] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const [crosshair, setCrosshair] = useState<CrosshairStyle>("Gradient");

  const value = useMemo<DemoState>(
    () => ({
      range,
      days: RANGE_DAYS[range],
      seed,
      replayKey,
      crosshair,
      indicatorDasharray: crosshair === "Dashed" ? [4, 4] : undefined,
      setRange,
      setCrosshair,
      shuffle: () => setSeed((s) => s + 1),
      replay: () => setReplayKey((k) => k + 1),
    }),
    [range, seed, replayKey, crosshair]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoState {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemo must be used inside <DemoProvider>");
  }
  return ctx;
}
