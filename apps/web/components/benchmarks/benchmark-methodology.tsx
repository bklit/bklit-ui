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
  "Animation is on for every scored run, using each library's default. TanStack Charts has no entrance animation by default, so its animated runs use the opt-in motion() renderer. Its numbers therefore reflect that renderer, not the plain default component.",
  "TanStack's motion() renderer pre-renders a hidden focus ring per point, so its DOM node count is higher than its static renderer would produce.",
  "TanStack hover uses its default nearest-point lookup, a linear scan. Its large-data guide recommends supplying a spatialIndex for dense charts; we use defaults.",
  "TanStack grouped bars need one row per category and series, so its adapter reshapes the data. That cost is included in its mount and update times.",
  "TanStack areas are an areaY plus a decorative lineY edge per series, as its docs recommend, so each series gets a single tooltip row.",
  "Recharts draws a dot on every line point by default. These are turned off (dot={false}) to match bklit, while the hover dot (activeDot) stays on. Recharts scatter points render as <path> elements.",
  "Recharts' default enter animation is 1,500 ms for line and area but 400 ms for bar and scatter. Recharts also skips animation when the OS prefers reduced motion, so run with that setting off. Use the animation reference table rather than comparing durations across chart types.",
  "Hover samples dispatch both pointermove and mousemove, because libraries listen to different events, and time each move to the next painted frame. Tooltip spring or tween motion after that frame is not counted.",
];

const METRICS = [
  {
    term: "Mount",
    detail:
      "Time from React's render call to the first painted frame of the chart. Timing stops at that frame, so the enter animation that follows is not counted.",
  },
  {
    term: "Update",
    detail:
      "Swap in a new dataset of the same size and shape, then time to the first painted frame. Any update or morph animation after that frame is not counted.",
  },
  {
    term: "Hover / move",
    detail:
      "Pointer moves dispatched across the plot area; each sample is the time from the event to the next painted frame (tooltip and crosshair updates included).",
  },
  {
    term: "DOM nodes",
    detail: "Elements inside the chart container after mount.",
  },
  {
    term: "Bundle (gzip)",
    detail:
      "A minimal line chart per library, bundled with esbuild (minified, React external) and gzipped. Measured at build time, not in your browser.",
  },
];

const CAVEATS = [
  "The score is 100 × the geometric mean of (best ÷ yours) over mount, update, hover, DOM nodes and bundle size, equally weighted, so the best library on every metric scores 100 and no single unit dominates. Percent differences are yours ÷ best − 1. The enter animation is never scored.",
  "Animations run with each library's defaults, as users see them, but scores stop at the first painted frame. The enter animation is reported separately as a reference.",
  "One warm-up run per library is discarded; scores are medians of the measured iterations. Raw samples are available per row.",
  "Every library renders at the same fixed pixel size with the same seeded data, and libraries run one after another, never at the same time.",
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
          description="Every score stops at the first painted frame."
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
