import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeWeekendIndexRuns,
  computeWeekendRanges,
  toValidDate,
} from "../date-ranges";

const day = (d: number, h = 0) => new Date(2024, 0, d, h); // Jan 2024: 6 = Sat, 7 = Sun
const spans = (ranges: { start: Date; end: Date }[]) =>
  ranges.map((r) => [r.start.getTime(), r.end.getTime()]);

describe("computeWeekendRanges", () => {
  it("merges Sat + Sun into one midnight-to-midnight span", () => {
    assert.deepEqual(spans(computeWeekendRanges(day(1), day(15))), [
      [day(6).getTime(), day(8).getTime()],
      [day(13).getTime(), day(15).getTime()],
    ]);
  });

  it("clips spans already in progress at the domain edges (brush zoom)", () => {
    assert.deepEqual(spans(computeWeekendRanges(day(7, 12), day(13, 6))), [
      [day(7, 12).getTime(), day(8).getTime()],
      [day(13).getTime(), day(13, 6).getTime()],
    ]);
  });

  it("supports custom weekend days and centered alignment", () => {
    // Fri + Sat, shifted half a day so the daily points sit mid-band.
    assert.deepEqual(
      spans(
        computeWeekendRanges(day(1), day(10), {
          weekendDays: [5, 6],
          align: "centered",
        })
      ),
      [[day(4, 12).getTime(), day(6, 12).getTime()]]
    );
  });

  it("returns nothing for empty weekend sets or oversized domains", () => {
    assert.deepEqual(
      computeWeekendRanges(day(1), day(30), { weekendDays: [] }),
      []
    );
    assert.deepEqual(
      computeWeekendRanges(day(1), day(30), { maxDays: 10 }),
      []
    );
  });
});

describe("computeWeekendIndexRuns", () => {
  it("groups consecutive weekend rows and breaks on missing dates", () => {
    const dates = [day(5), day(6), day(7), day(8), day(13), null, day(14)];
    assert.deepEqual(computeWeekendIndexRuns(dates), [
      [1, 2],
      [4, 4],
      [6, 6],
    ]);
  });
});

describe("toValidDate", () => {
  it("parses date-only ISO strings as local midnight", () => {
    assert.equal(toValidDate("2024-01-06")?.getDay(), 6);
  });
});
