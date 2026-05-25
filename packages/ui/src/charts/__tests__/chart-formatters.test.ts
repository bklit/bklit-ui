import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hmsTimeFmt,
  intFmt,
  shortDateFmt,
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
});
