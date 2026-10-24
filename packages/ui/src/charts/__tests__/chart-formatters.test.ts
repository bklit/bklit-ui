import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hmsTimeFmt,
  intFmt,
  lazyLabels,
  shortDateFmt,
  valueLabelFmt,
  weekdayDateFmt,
} from "../chart-formatters";

const sampleDates = [
  new Date(2025, 0, 5, 9, 8, 7),
  new Date(2024, 11, 31, 23, 59, 59),
  new Date(2026, 6, 4, 12, 0, 0),
];

const sampleNumbers = [0, 42, 1234, 1_234_567, -9876.5];

describe("chart-formatters", () => {
  describe("shortDateFmt", () => {
    for (const date of sampleDates) {
      it(`matches toLocaleDateString for ${date.toISOString()}`, () => {
        assert.equal(
          shortDateFmt.format(date),
          date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        );
      });
    }
  });

  describe("weekdayDateFmt", () => {
    for (const date of sampleDates) {
      it(`matches toLocaleDateString for ${date.toISOString()}`, () => {
        assert.equal(
          weekdayDateFmt.format(date),
          date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
        );
      });
    }
  });

  describe("hmsTimeFmt", () => {
    for (const date of sampleDates) {
      it(`matches toLocaleTimeString for ${date.toISOString()}`, () => {
        assert.equal(
          hmsTimeFmt.format(date),
          date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
        );
      });
    }
  });

  describe("intFmt", () => {
    for (const value of sampleNumbers) {
      it(`matches toLocaleString for ${value}`, () => {
        assert.equal(intFmt(value), value.toLocaleString("en-US"));
      });
    }

    it("is a reusable formatter function", () => {
      const formatValue = intFmt;
      assert.equal(formatValue(1000), (1000).toLocaleString("en-US"));
    });
  });

  describe("valueLabelFmt", () => {
    it("uses English digits and keeps value labels to integers", () => {
      assert.equal(valueLabelFmt(1234), "1,234");
      assert.equal(valueLabelFmt(1234.5), "1,235");
    });
  });

  describe("lazyLabels", () => {
    it("acts like an eager array and formats each label once, on read", () => {
      const calls: number[] = [];
      const format = (index: number) => {
        calls.push(index);
        return `L${index}`;
      };
      const labels = lazyLabels(500, format);
      assert.equal(calls.length, 0);
      assert.equal(labels.length, 500);
      assert.ok(Array.isArray(labels));
      assert.equal(labels[7], "L7");
      assert.equal(labels[7], "L7");
      assert.deepEqual(calls, [7]);
      assert.equal(labels[500], undefined);
      assert.ok(3 in labels);
      assert.deepEqual(
        labels.map((label) => label),
        Array.from({ length: 500 }, (_, index) => `L${index}`)
      );
      assert.equal(labels.at(-1), "L499");
    });

    it("formats small lists up front", () => {
      assert.deepEqual(
        lazyLabels(3, (index) => `#${index}`),
        ["#0", "#1", "#2"]
      );
    });
  });
});
