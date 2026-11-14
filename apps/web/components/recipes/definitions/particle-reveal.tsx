"use client";

import type { ParticleLineEffect } from "@bklitui/ui/charts";
import {
  PARTICLE_LINE_TONES,
  ParticleLineDemo,
  particleLineColorList,
  particleLineSnippet,
} from "@/components/docs/particle-line-demo";
import type { Recipe, RecipeChart } from "@/lib/recipes/types";
import { recipeDailyData } from "../recipe-data";

interface Variant {
  effect: ParticleLineEffect;
  label: string;
  component: string;
  /** How the reveal plays — used in the prompt. */
  motion: string;
}

const VARIANTS: Variant[] = [
  {
    effect: "assemble",
    label: "Assemble",
    component: "ParticleAssembleChart",
    motion:
      "thousands of particles drift in from above and to the right, swirling as they fall, and settle onto the lines; where they land the lines turn solid",
  },
  {
    effect: "comet",
    label: "Comet",
    component: "ParticleCometChart",
    motion:
      "the lines grow left to right behind large glowing heads that stream long, slow tails of embers back along the lines, like comets",
  },
  {
    effect: "stardust",
    label: "Stardust",
    component: "ParticleStardustChart",
    motion:
      "the lines grow left to right from soft glinting tips that leave twinkling dust which drifts gently upward and lingers for a couple of seconds",
  },
];

const PREVIEWS: Record<ParticleLineEffect, () => React.JSX.Element> = {
  assemble: () => <ParticleLineDemo data={recipeDailyData} effect="assemble" />,
  comet: () => <ParticleLineDemo data={recipeDailyData} effect="comet" />,
  stardust: () => <ParticleLineDemo data={recipeDailyData} effect="stardust" />,
};

function variantChart(variant: Variant): RecipeChart {
  const { primary, secondary } = PARTICLE_LINE_TONES[variant.effect];
  return {
    id: variant.effect,
    label: variant.label,
    rootComponent: "LineChart",
    Preview: PREVIEWS[variant.effect],
    install: ["line-chart", "particle-line"],
    steps: [
      "Remove `<Grid />`, `<Background />` and every `<YAxis />`; keep `<XAxis />`. Set `margin={{ top: 28, right: 24, bottom: 36, left: 24 }}`.",
      `Replace each \`<Line>\` with \`<ParticleLine effect="${variant.effect}">\` from \`@/components/charts/particle-line\`, keeping its \`dataKey\`. The primary series is ${primary.name}: \`colors={${particleLineColorList(primary.colors)}}\` and \`stroke="${primary.stroke}"\`. Secondary series are ${secondary.name}: \`colors={${particleLineColorList(secondary.colors)}}\`, \`stroke="${secondary.stroke}"\`, \`strokeWidth={1.5}\`, \`density={3}\` and \`spread={110}\` so they read quieter. \`stroke\` is what the tooltip uses for that series' dot and legend colour.`,
      "Leave `duration` and `delay` unset — `<ParticleLine>` follows the chart's own reveal (1100ms, `cubic-bezier(0.85, 0, 0.15, 1)`) and sweeps by x position, so every series reaches each date at the same moment.",
      "Keep `<ChartTooltip />` with its defaults (date pill, per-series dots). `<ParticleLine>` has the faded hover segment built in (`highlight={{ span: 3, fadeLength: 40, dimOpacity: 0.25 }}` by default — the Sunset and Aurora sky values); leave `highlight` unset.",
    ],
    code: particleLineSnippet(variant.effect, variant.component),
  };
}

export const particleReveal: Recipe = {
  id: "particle-reveal",
  title: "Particle reveal",
  category: "color-shape",
  description:
    "Lines revealed with glowing WebGL particles — a swarm that condenses into the line, or a glowing tip that grows it.",
  look: `no grid and no y-axis — only the lines and the x-axis, on the page's own background. The lines are round-capped strokes with a soft glow, painted with a left-to-right colour ramp. On load, ${VARIANTS.map((v) => `${v.label} (${PARTICLE_LINE_TONES[v.effect].primary.name} and ${PARTICLE_LINE_TONES[v.effect].secondary.name} lines): ${v.motion}`).join("; ")}. In every variant the freshly-revealed stretch glows white-hot and cools as the reveal moves on; all lines sweep left to right together on the library's standard 1.1s ease-in-out reveal, then rest as solid strokes. Hovering drops the glow and dims each line to a quarter strength except a soft-ended segment about three points either side of the cursor, which follows it smoothly — the same faded segment as the Sunset and Aurora skies — along with the usual crosshair, date pill and a dot in each series' colour.`,
  charts: VARIANTS.map(variantChart),
};
