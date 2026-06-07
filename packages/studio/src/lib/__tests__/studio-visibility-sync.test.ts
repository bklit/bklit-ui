import { describe, expect, it } from "vitest";
import { defaultStudioState } from "@/lib/studio-parsers";
import { expandStudioParamUpdate } from "@/lib/studio-visibility-sync";

describe("expandStudioParamUpdate", () => {
  it("syncs showLegend when legend eye toggle changes", () => {
    const prev = { ...defaultStudioState(), chart: "line-chart" as const };
    const expanded = expandStudioParamUpdate(prev, {
      hiddenComponents: "line.legend",
    });
    expect(expanded.showLegend).toBe(false);
  });

  it("syncs hiddenComponents when showLegend switch changes", () => {
    const prev = { ...defaultStudioState(), chart: "line-chart" as const };
    const expanded = expandStudioParamUpdate(prev, { showLegend: false });
    expect(expanded.hiddenComponents).toContain("line.legend");
  });

  it("syncs showBrush when brush eye toggle changes", () => {
    const prev = { ...defaultStudioState(), chart: "line-chart" as const };
    const expanded = expandStudioParamUpdate(prev, {
      hiddenComponents: "line.brush",
    });
    expect(expanded.showBrush).toBe(false);
  });
});
