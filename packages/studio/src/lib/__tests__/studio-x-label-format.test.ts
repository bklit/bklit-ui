import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultStudioState } from "../studio-parsers";
import {
  decodeStudioUrlState,
  encodeStudioUrlState,
} from "../studio-url-codec";
import {
  studioXLabelFormatter,
  xLabelFormatCodegen,
  xLabelFormatPropCodegen,
} from "../studio-x-label-format";

describe("time-series label presets", () => {
  it("retains a non-default format in shared compressed URLs", () => {
    const state = defaultStudioState({
      chart: "area-chart",
      xLabelFormat: "stockholmDate",
    });
    assert.equal(
      decodeStudioUrlState(encodeStudioUrlState(state))?.xLabelFormat,
      "stockholmDate"
    );
  });
  it("preserves the chart defaults unless a preset is selected", () => {
    const state = { xLabelFormat: "default" } as const;
    assert.equal(studioXLabelFormatter(state), undefined);
    assert.equal(xLabelFormatCodegen(state), "");
    assert.equal(xLabelFormatPropCodegen(state), "");
  });
  it("formats hours in UTC across midnight without a viewer timezone shift", () => {
    const format = studioXLabelFormatter({ xLabelFormat: "utcTime" });
    assert.equal(format?.(new Date("2026-01-01T00:00:00Z")), "00:00");
    assert.equal(format?.(new Date("2026-01-01T23:30:00Z")), "23:30");
  });
  it("formats the calendar date in Stockholm on both sides of the DST jump", () => {
    const format = studioXLabelFormatter({ xLabelFormat: "stockholmDate" });
    const expected = new Intl.DateTimeFormat("sv-SE", {
      day: "numeric",
      month: "short",
      timeZone: "Europe/Stockholm",
    });
    for (const instant of [
      "2026-03-28T23:30:00Z",
      "2026-03-29T01:30:00Z",
      "2026-07-01T22:30:00Z",
    ]) {
      const date = new Date(instant);
      assert.equal(format?.(date), expected.format(date));
    }
  });
  it("exports reusable formatter declarations and matching callback props", () => {
    for (const xLabelFormat of ["utcTime", "stockholmDate"] as const) {
      const code = xLabelFormatCodegen({ xLabelFormat });
      assert.ok(
        code.startsWith("const formatXLabel = new Intl.DateTimeFormat(")
      );
      assert.ok(code.includes('"timeZone":'));
      assert.ok(code.endsWith(".format;\n"));
      assert.equal(
        xLabelFormatPropCodegen({ xLabelFormat }),
        " formatXLabel={formatXLabel}"
      );
    }
  });
});
