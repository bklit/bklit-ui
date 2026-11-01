import { BENCH_ADAPTERS } from "./adapters";
import {
  BenchCollapsibleFrame,
  BenchFrame,
  BenchPanel,
} from "./benchmark-frame";
import type { BenchLibraryId } from "./types";

const LIBRARY_ORDER: BenchLibraryId[] = ["bklit", "recharts", "tanstack"];

/** Cross-library caveats on how each chart was configured. */
export const BENCH_FAIRNESS_NOTES: string[] = [
  "Every library draws the same chrome: horizontal grid, x axis, a hover tooltip with a cursor or crosshair, no legend, and a monotone curve for line and area. Each uses its own idiomatic, documented API at a fixed pixel size.",
  "Timings stop at the frame that actually shows the chart, checked the same way for every library (an svg, tick labels and the expected marks), not at the first frame after React's render call. bklit sizes itself from its parent with a ResizeObserver and draws a frame or two after mount; those frames count against it.",
  "Animation can be switched off for a static comparison (each library's own off switch; TanStack's default Chart). With animation on, TanStack uses its opt-in motion() renderer, since its default component has no entrance animation, and its tooltip and crosshair tweens are turned off so hover snaps like the others.",
  "With animation on, TanStack's motion() renderer pre-renders a hidden focus ring per point, so its DOM node count is higher than its static renderer's.",
  "bklit line and area charts downsample each series to 1.5 points per plot pixel (Largest-Triangle-Three-Buckets). From roughly 1,000 points up their paths hold fewer points than Recharts' or TanStack's, which draw every point. That is a bklit feature, and part of why it scales; bar and scatter draw every point in every library.",
  'TanStack hover uses focus: "group-x", its documented setup for a shared x tooltip, which scans every point per move; a spatialIndex is not consulted for group-x. Recharts\' active-index lookup is also linear; bklit bisects.',
  "TanStack grouped bars need one row per category and series, so its adapter reshapes the data. That cost is included in its mount and update times.",
  "TanStack areas are an areaY plus a decorative lineY edge per series, as its docs recommend, so each series gets a single tooltip row.",
  "Recharts draws a dot on every line point by default. These are turned off (dot={false}) to match bklit, while the hover dot (activeDot) stays on. Recharts scatter points render as <path> elements, and its time axis reads a precomputed epoch-ms key, the string dataKey its performance guide recommends.",
  "Recharts' default enter animation is 1,500 ms for line and area but 400 ms for bar and scatter. With animation on, Recharts skips bars until they start to grow, so animated bar charts count as drawn once the plot and axis are up. Recharts also skips animation when the OS prefers reduced motion, so run with that setting off.",
  "Hover sends what a real mouse would (over/out when the element under the pointer changes, then pointermove and mousemove) to the element actually under each point. Line, area and bar sweep across the plot; scatter moves across rendered points, because Recharts' scatter tooltip only reacts over a point. Each move starts right after a paint. A library that defers its hover render to a task or rAF is followed to the frame that paints it, and that work counts. Tooltip spring or tween motion after that frame is not counted.",
];

const METRICS = [
  {
    term: "Mount",
    detail:
      "Wall-clock time from React's render call to the first painted frame that shows the chart (svg, tick labels and marks), so frames a library waits for (e.g. to size itself) count in full. Animated: the enter animation that follows is not counted. Static: timing runs to the frame that paints the last DOM change.",
  },
  {
    term: "Update",
    detail:
      "Swap in a new dataset of the same size and shape (generated before the timer starts), starting right after a paint. Measured as main-thread busy time, not wall-clock: React's synchronous commit plus any microtasks, tasks and rAF callbacks the library defers work to, plus the browser's style, layout and paint, up to the painted frame that shows the result. Idle time waiting for the next frame is not counted. Static: every pass up to the frame that paints the last DOM change. Animated: up to the first painted frame; the morph after it is not counted.",
  },
  {
    term: "Hover / move",
    detail:
      "Pointer moves dispatched across the plot area (or across points, for scatter). Each sample is main-thread busy time from the event to the painted frame that shows the tooltip and crosshair update: the event handlers, any microtasks, tasks or rAF callbacks the library defers its render to, and the browser's style, layout and paint. Idle time waiting for the next frame is not counted. Hit testing the next target is runner work, done before the timer starts.",
  },
  {
    term: "DOM nodes",
    detail: "Elements inside the chart container after mount.",
  },
  {
    term: "Bundle (gzip)",
    detail:
      "A minimal line chart per library, bundled with esbuild (minified, React external) and gzipped, with what each library ships for the chosen animation setting (TanStack adds its motion() renderer only when animation is on). With animation off, TanStack is measured from its separate static entry (default Chart, no motion() renderer), while bklit and Recharts each have a single entry, so their figures still include their animation code: Motion for bklit, Recharts' built-in animation. Measured at build time, not in your browser.",
  },
];

const CAVEATS = [
  "The score is 100 × the geometric mean of (best ÷ yours) over mount, update, hover, DOM nodes and bundle size, equally weighted, so the best library on every metric scores 100 and no single unit dominates. Percent differences are yours ÷ best − 1. The enter animation is never scored.",
  "With animation on, each library uses its defaults, as users see them, but scores stop at the first painted frame that shows the chart. Switch animation off for the cleanest like-for-like comparison. The enter animation is always reported separately as a reference.",
  "One warm-up run per library is discarded; scores are medians of the measured iterations. Iterations are interleaved and the starting library rotates, so no library always runs right after the same neighbour. Raw samples are available per row.",
  "Every library renders at the same fixed pixel size with fresh copies of the same seeded data, and only one chart is mounted at a time.",
  "Mount ends at a painted frame, so it moves in steps of one display frame (about 16.7 ms at 60 Hz); differences smaller than a frame mostly reflect where in the frame the work landed.",
  "Update and hover use a busy-time probe instead: a chain of MessageChannel tasks that runs whenever the main thread is free. Any gap between two of its tasks over 0.25 ms is counted as work, so the wait for vsync drops out and results aren't quantised to frames. The same probe runs for every library.",
  "Busy time is main-thread work only. Raster and compositing on other threads, and work a library leaves for after the measured frame (an idle callback, a tween), are not counted. Unrelated main-thread work during the window (garbage collection, extensions) is, for every library alike.",
  "Browsers coarsen timers (often to 0.1 ms or more without cross-origin isolation), so very small differences are noise.",
  "Background tabs throttle animation frames: keep this tab visible and focused while a run is in progress.",
  "Extensions, other tabs, power-saving modes, and thermal throttling all skew results. Run on a quiet machine and compare runs from the same device.",
  "Results vary a lot between devices and browsers. Treat these as your numbers on your machine, and run it yourself rather than trusting a screenshot.",
];

export function BenchmarkMethodology() {
  const adapterNotes = LIBRARY_ORDER.flatMap((library) => {
    const adapter = BENCH_ADAPTERS[library];
    return adapter.notes ? [{ name: adapter.name, note: adapter.notes }] : [];
  });

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* items-start: an open frame mustn't stretch its closed neighbour. */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-6">
        <BenchCollapsibleFrame
          description="Every timing ends at the painted frame that shows the result. Mount is wall-clock; update and hover count main-thread work only."
          title="What's measured"
        >
          <BenchPanel className="text-sm">
            <dl className="flex flex-col gap-3">
              {METRICS.map(({ term, detail }) => (
                <div key={term}>
                  <dt className="font-medium">{term}</dt>
                  <dd className="text-muted-foreground">{detail}</dd>
                </div>
              ))}
            </dl>
          </BenchPanel>
        </BenchCollapsibleFrame>
        <BenchCollapsibleFrame
          description="Timings are your device, your browser, right now."
          title="How to read it"
        >
          <BenchPanel className="text-sm">
            <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
              {CAVEATS.map((caveat) => (
                <li key={caveat}>{caveat}</li>
              ))}
            </ul>
          </BenchPanel>
        </BenchCollapsibleFrame>
      </div>
      <BenchFrame
        description="How each library's chart was configured, and what couldn't be matched exactly."
        title="Fairness notes"
      >
        {adapterNotes.length > 0 ? (
          <BenchPanel className="text-sm" variant="ghost">
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {adapterNotes.map(({ name, note }) => (
                <div key={name}>
                  <dt className="font-medium">{name}</dt>
                  <dd className="text-muted-foreground">{note}</dd>
                </div>
              ))}
            </dl>
          </BenchPanel>
        ) : null}
        <BenchPanel className="text-sm">
          <ul className="flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
            {BENCH_FAIRNESS_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </BenchPanel>
      </BenchFrame>
    </div>
  );
}
