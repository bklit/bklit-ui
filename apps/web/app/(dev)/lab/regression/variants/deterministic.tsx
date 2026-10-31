"use client";

import type { FeatureCollection, Geometry } from "geojson";
import { type ReactNode, useLayoutEffect } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldCountries from "@/lib/og-data/world-countries.json";

/**
 * Helpers that make ported examples deterministic, so a recorded baseline
 * replays to the exact same geometry: seeded randomness, a fixed "now" for
 * data that the sources build relative to `Date.now()`, and the bundled world
 * TopoJSON (the demos fetch it from GitHub; the box has no internet).
 */

/** Fixed reference instant for data the sources build from `Date.now()`. */
export const LAB_NOW = new Date(2024, 5, 30, 12, 0, 0).getTime();

const DAY_MS = 24 * 60 * 60 * 1000;

/** `new Date(Date.now() - n days)` with `LAB_NOW` instead of the clock. */
export function daysAgo(days: number): Date {
  return new Date(LAB_NOW - days * DAY_MS);
}

const PARK_MILLER_MODULUS = 2_147_483_647;

/**
 * Park–Miller "minimal standard" PRNG with `Math.random()`'s contract
 * (`[0, 1)`). Plain integer arithmetic (exact in doubles), no bitwise ops.
 */
export function seededRandom(seed: number): () => number {
  let state = (Math.abs(Math.trunc(seed)) % (PARK_MILLER_MODULUS - 1)) + 1;
  return () => {
    state = (state * 48_271) % PARK_MILLER_MODULUS;
    return (state - 1) / (PARK_MILLER_MODULUS - 1);
  };
}

type FrozenClock = (() => number) & { real?: () => number };

let frozenMounts = 0;

function freezeClock(at: number) {
  if (!(Date.now as FrozenClock).real) {
    const real = Date.now;
    Date.now = Object.assign(() => at, { real });
  }
}

function restoreClock() {
  const current = Date.now as FrozenClock;
  if (current.real) {
    Date.now = current.real;
  }
}

/**
 * Pins `Date.now()` to `at` for as long as the subtree is mounted, so lazy
 * state initialisers that read the clock (LiveLineChart's `now`, which runs
 * only once the chart has been measured) see a fixed instant. Combine with
 * `paused` so the live loop never advances. The clock is global: anything
 * else on the page reading `Date.now()` meanwhile sees `at` too, which is
 * fine for a lab page; it is restored when the last `FrozenNow` unmounts.
 */
export function FrozenNow({
  at,
  children,
}: {
  at: number;
  children: ReactNode;
}) {
  // Render time: before the first child render. Layout effect: re-arms after
  // a StrictMode unmount/remount, still before ParentSize's measurement.
  freezeClock(at);
  useLayoutEffect(() => {
    frozenMounts += 1;
    freezeClock(at);
    return () => {
      frozenMounts -= 1;
      if (frozenMounts === 0) {
        restoreClock();
      }
    };
  }, [at]);
  return children;
}

interface CountryProperties {
  name: string;
  [key: string]: unknown;
}

let worldCache: FeatureCollection<Geometry, CountryProperties> | null = null;

/**
 * Same TopoJSON the choropleth demos fetch (`WORLD_DATA_URL`), from the copy
 * bundled for the OG route (`lib/og-data/world-countries.json`), converted the
 * same way `fetchWorldData()` does.
 */
export function labWorldData(): FeatureCollection<Geometry, CountryProperties> {
  if (worldCache) {
    return worldCache;
  }
  const topology = worldCountries as unknown as Topology<{
    [key: string]: GeometryCollection<CountryProperties>;
  }>;
  const objectKey = Object.keys(topology.objects)[0];
  const geoObject = objectKey ? topology.objects[objectKey] : undefined;
  if (!geoObject) {
    throw new Error("world-countries.json has no objects");
  }
  worldCache = feature(topology, geoObject) as unknown as FeatureCollection<
    Geometry,
    CountryProperties
  >;
  return worldCache;
}
