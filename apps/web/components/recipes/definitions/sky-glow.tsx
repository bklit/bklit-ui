"use client";

import {
  ChartTooltip,
  Line,
  LineBackdrop,
  type LineBackdropStop,
  LineChart,
  type LineGlow,
  type LineHighlight,
} from "@bklitui/ui/charts";
import type { Recipe } from "@/lib/recipes/types";

/** One radial glow clipped to the sky above the line. */
interface SkyBackdrop {
  center: { x: number; y: number };
  radius: { x: number; y: number };
  stops: LineBackdropStop[];
}

type SkyHighlight = Required<
  Pick<LineHighlight, "dimOpacity" | "fadeLength" | "span" | "strokeWidth">
> & { glow: Required<Pick<LineGlow, "blur">> };

interface SkyStar {
  left: string;
  top: string;
  opacity: number;
}

/** Everything that differs between the Sunset and Aurora scenes. */
interface SkyPalette {
  /** CSS `background` of the scene container (shows below the line). */
  background: string;
  /** Painted in order — later backdrops sit on top. */
  backdrops: SkyBackdrop[];
  /** Line stroke gradient, left → right. */
  line: string[];
  /** Solid line colour (markers, fallback). */
  stroke: string;
  glow: Required<Pick<LineGlow, "blur" | "opacity">>;
  /** Hover segment: soft-ended, glowing, the rest of the line dims. */
  highlight: SkyHighlight;
  dot: string;
  crosshair: string;
  stars: SkyStar[];
  starColor: string;
}

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

const SKY_POINT_COUNT = 28;

/** Line sits in the lower half so the glow has sky above it. */
const SKY_HEADROOM = 2.2;

interface Ridge {
  at: number;
  height: number;
  width: number;
}

/** A smooth horizon: a base slope plus a few gaussian ridges, in visitors. */
function skyData(ridges: Ridge[], slope: number) {
  return Array.from({ length: SKY_POINT_COUNT }, (_, index) => {
    const t = index / (SKY_POINT_COUNT - 1);
    const ridge = ridges.reduce(
      (sum, r) => sum + r.height * Math.exp(-(((t - r.at) / r.width) ** 2)),
      0
    );
    return {
      date: new Date(2026, 9, index + 1),
      visitors: Math.round((30 + ridge + slope * t) * 60),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Palettes                                                                   */
/* -------------------------------------------------------------------------- */

const SUNSET: SkyPalette = {
  background: "linear-gradient(to bottom, #211c2b, #18161d)",
  backdrops: [
    {
      // Warm horizon → dusk purple → transparent.
      center: { x: 0.45, y: 0.82 },
      radius: { x: 0.95, y: 0.6 },
      stops: [
        { offset: 0, color: "#b4703c", opacity: 1 },
        { offset: 0.22, color: "#b4703c", opacity: 0.85 },
        { offset: 0.45, color: "#7a4650", opacity: 0.7 },
        { offset: 0.7, color: "#3e2a48", opacity: 0.45 },
        { offset: 1, color: "#3e2a48", opacity: 0 },
      ],
    },
    {
      // Golden pool on the right where the line runs yellow.
      center: { x: 0.88, y: 0.85 },
      radius: { x: 0.35, y: 0.22 },
      stops: [
        { offset: 0, color: "#8a6a2a", opacity: 0.6 },
        { offset: 1, color: "#8a6a2a", opacity: 0 },
      ],
    },
  ],
  line: ["#d9622b", "#f0b25a", "#f7dc9a"],
  stroke: "#f0b25a",
  glow: { blur: 5, opacity: 0.85 },
  highlight: {
    dimOpacity: 0.25,
    fadeLength: 40,
    glow: { blur: 6 },
    span: 3,
    strokeWidth: 2.5,
  },
  dot: "#fff1d0",
  crosshair: "#3e2a48",
  stars: [
    { left: "14%", top: "22%", opacity: 0.3 },
    { left: "38%", top: "13%", opacity: 0.3 },
    { left: "77%", top: "4%", opacity: 0.3 },
    { left: "92%", top: "26%", opacity: 0.3 },
  ],
  starColor: "#ffffff",
};

const AURORA: SkyPalette = {
  background: "linear-gradient(to bottom, #030812, #050d14)",
  backdrops: [
    {
      // Teal haze along the horizon.
      center: { x: 0.5, y: 1 },
      radius: { x: 1, y: 0.55 },
      stops: [
        { offset: 0, color: "#0f4a48", opacity: 0.8 },
        { offset: 1, color: "#0a2a30", opacity: 0 },
      ],
    },
    {
      // Curtains — tall, narrow ellipses rising from the line.
      center: { x: 0.18, y: 0.62 },
      radius: { x: 0.14, y: 0.75 },
      stops: [
        { offset: 0, color: "#38f5a6", opacity: 0.6 },
        { offset: 0.45, color: "#1fc8a0", opacity: 0.28 },
        { offset: 1, color: "#1fc8a0", opacity: 0 },
      ],
    },
    {
      center: { x: 0.42, y: 0.55 },
      radius: { x: 0.12, y: 0.85 },
      stops: [
        { offset: 0, color: "#4bf0c8", opacity: 0.55 },
        { offset: 0.5, color: "#2ab8c8", opacity: 0.22 },
        { offset: 1, color: "#2ab8c8", opacity: 0 },
      ],
    },
    {
      // Thin rays between the main curtains break up the rhythm.
      center: { x: 0.3, y: 0.5 },
      radius: { x: 0.05, y: 0.8 },
      stops: [
        { offset: 0, color: "#5cffc0", opacity: 0.4 },
        { offset: 1, color: "#5cffc0", opacity: 0 },
      ],
    },
    {
      center: { x: 0.75, y: 0.45 },
      radius: { x: 0.05, y: 0.75 },
      stops: [
        { offset: 0, color: "#8f8cff", opacity: 0.4 },
        { offset: 1, color: "#8f8cff", opacity: 0 },
      ],
    },
    {
      center: { x: 0.64, y: 0.5 },
      radius: { x: 0.13, y: 0.8 },
      stops: [
        { offset: 0, color: "#5fd9ff", opacity: 0.4 },
        { offset: 0.5, color: "#6b7cff", opacity: 0.22 },
        { offset: 1, color: "#6b7cff", opacity: 0 },
      ],
    },
    {
      center: { x: 0.86, y: 0.48 },
      radius: { x: 0.16, y: 0.75 },
      stops: [
        { offset: 0, color: "#b07bff", opacity: 0.55 },
        { offset: 0.5, color: "#8a5cf0", opacity: 0.25 },
        { offset: 1, color: "#8a5cf0", opacity: 0 },
      ],
    },
  ],
  line: ["#3cf2a0", "#3fd6e8", "#a77bff"],
  stroke: "#3fd6e8",
  glow: { blur: 6, opacity: 0.9 },
  highlight: {
    dimOpacity: 0.25,
    fadeLength: 45,
    glow: { blur: 8 },
    span: 4,
    strokeWidth: 2.5,
  },
  dot: "#e8fff6",
  crosshair: "#2ab8c8",
  stars: [
    { left: "9%", top: "8%", opacity: 0.5 },
    { left: "33%", top: "14%", opacity: 0.35 },
    { left: "55%", top: "5%", opacity: 0.45 },
    { left: "74%", top: "18%", opacity: 0.3 },
    { left: "96%", top: "10%", opacity: 0.5 },
  ],
  starColor: "#e8fff6",
};

/* -------------------------------------------------------------------------- */
/* Preview                                                                    */
/* -------------------------------------------------------------------------- */

const SKY_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };

function SkyGlowChart({
  palette,
  data,
}: {
  palette: SkyPalette;
  data: { date: Date; visitors: number }[];
}) {
  const peak = Math.max(...data.map((d) => d.visitors));
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      style={{ background: palette.background }}
    >
      <LineChart
        data={data}
        margin={SKY_MARGIN}
        yScaleDomainMax={peak * SKY_HEADROOM}
      >
        {palette.backdrops.map((backdrop) => (
          <LineBackdrop
            center={backdrop.center}
            dataKey="visitors"
            key={`${backdrop.center.x}-${backdrop.center.y}`}
            radius={backdrop.radius}
            stops={backdrop.stops}
          />
        ))}
        {palette.stars.length > 0 ? (
          <LineBackdrop dataKey="visitors">
            {palette.stars.map((star) => (
              <rect
                fill={palette.starColor}
                height={3}
                key={`${star.left}-${star.top}`}
                opacity={star.opacity}
                width={3}
                x={star.left}
                y={star.top}
              />
            ))}
          </LineBackdrop>
        ) : null}
        <Line
          dataKey="visitors"
          fadeEdges={false}
          glow={palette.glow}
          highlight={palette.highlight}
          stroke={palette.stroke}
          strokeGradient={palette.line}
          strokeWidth={2}
        />
        <ChartTooltip
          dotColor={palette.dot}
          dotHaloBlur={4}
          dotHaloOpacity={0.7}
          dotHaloScale={2.4}
          dotSize={4.5}
          indicatorColor={palette.crosshair}
          indicatorEnd="point"
          indicatorEndColor={palette.dot}
          indicatorFadeEdges="top"
          indicatorFadeLength={35}
          showDatePill={false}
          topOffset={16}
        />
      </LineChart>
    </div>
  );
}

const sunsetData = skyData(
  [
    { at: 0.36, height: 18, width: 0.2 },
    { at: 0.72, height: 6, width: 0.12 },
  ],
  -6
);
const auroraData = skyData(
  [
    { at: 0.12, height: 7, width: 0.1 },
    { at: 0.38, height: 12, width: 0.12 },
    { at: 0.66, height: 8, width: 0.1 },
    { at: 0.9, height: 10, width: 0.1 },
  ],
  0
);

function SunsetSky() {
  return <SkyGlowChart data={sunsetData} palette={SUNSET} />;
}
function AuroraSky() {
  return <SkyGlowChart data={auroraData} palette={AURORA} />;
}

/* -------------------------------------------------------------------------- */
/* Snippets + prompt steps (generated from the same palettes)                 */
/* -------------------------------------------------------------------------- */

function fmtHighlight(h: SkyHighlight): string {
  return `{ dimOpacity: ${h.dimOpacity}, fadeLength: ${h.fadeLength}, glow: { blur: ${h.glow.blur} }, span: ${h.span}, strokeWidth: ${h.strokeWidth} }`;
}

function fmtStop(stop: LineBackdropStop): string {
  return `{ offset: ${stop.offset}, color: "${stop.color}", opacity: ${stop.opacity ?? 1} }`;
}

function fmtBackdrop(backdrop: SkyBackdrop): string {
  const pad = "        ";
  return [
    `${pad}<LineBackdrop`,
    `${pad}  center={{ x: ${backdrop.center.x}, y: ${backdrop.center.y} }}`,
    `${pad}  dataKey="visitors"`,
    `${pad}  radius={{ x: ${backdrop.radius.x}, y: ${backdrop.radius.y} }}`,
    `${pad}  stops={[`,
    ...backdrop.stops.map((stop) => `${pad}    ${fmtStop(stop)},`),
    `${pad}  ]}`,
    `${pad}/>`,
  ].join("\n");
}

function skySnippet(component: string, palette: SkyPalette): string {
  const hasStars = palette.stars.length > 0;
  const starsBlock = hasStars
    ? `
const STARS = [
${palette.stars
  .map(
    (star) =>
      `  { left: "${star.left}", top: "${star.top}", opacity: ${star.opacity} },`
  )
  .join("\n")}
];
`
    : "";
  const starsJsx = hasStars
    ? `
        <LineBackdrop dataKey="visitors">
          {STARS.map((star) => (
            <rect
              fill="${palette.starColor}"
              height={3}
              key={\`\${star.left}-\${star.top}\`}
              opacity={star.opacity}
              width={3}
              x={star.left}
              y={star.top}
            />
          ))}
        </LineBackdrop>`
    : "";

  return `"use client";

import { Line, LineChart } from "@/components/charts/line-chart";
import { LineBackdrop } from "@/components/charts/line-backdrop";
import { ChartTooltip } from "@/components/charts/tooltip";
${starsBlock}
export function ${component}({
  data,
}: {
  data: { date: Date; visitors: number }[];
}) {
  const peak = Math.max(...data.map((d) => d.visitors));

  return (
    // The scene carries its own sky, so it looks the same in light and dark mode.
    <div
      className="relative w-full overflow-hidden rounded-xl"
      style={{ background: "${palette.background}" }}
    >
      <LineChart
        data={data}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        yScaleDomainMax={peak * ${SKY_HEADROOM}}
      >
${palette.backdrops.map(fmtBackdrop).join("\n")}${starsJsx}
        <Line
          dataKey="visitors"
          fadeEdges={false}
          glow={{ blur: ${palette.glow.blur}, opacity: ${palette.glow.opacity} }}
          highlight={{
            dimOpacity: ${palette.highlight.dimOpacity},
            fadeLength: ${palette.highlight.fadeLength},
            glow: { blur: ${palette.highlight.glow.blur} },
            span: ${palette.highlight.span},
            strokeWidth: ${palette.highlight.strokeWidth},
          }}
          stroke="${palette.stroke}"
          strokeGradient={[${palette.line.map((c) => `"${c}"`).join(", ")}]}
          strokeWidth={2}
        />
        <ChartTooltip
          dotColor="${palette.dot}"
          dotHaloBlur={4}
          dotHaloOpacity={0.7}
          dotHaloScale={2.4}
          dotSize={4.5}
          indicatorColor="${palette.crosshair}"
          indicatorEnd="point"
          indicatorEndColor="${palette.dot}"
          indicatorFadeEdges="top"
          indicatorFadeLength={35}
          showDatePill={false}
          topOffset={16}
        />
      </LineChart>
    </div>
  );
}
`;
}

function skySteps(palette: SkyPalette, sceneStep: string): string[] {
  return [
    `Wrap the \`<LineChart>\` in a \`relative w-full overflow-hidden rounded-xl\` div with \`style={{ background: "${palette.background}" }}\` — the scene paints its own sky, so it is intentionally the same in light and dark mode (this recipe's colours are scene colours, not theme tokens).`,
    "Remove `<Grid />`, `<XAxis />` and any `<YAxis />` from the chart, set `margin={{ top: 0, right: 0, bottom: 0, left: 0 }}`, and set `yScaleDomainMax` to about 2.2× the series peak so the line sits in the lower half with open sky above it.",
    `Add ${palette.backdrops.length === 1 ? "a `<LineBackdrop>`" : `${palette.backdrops.length} \`<LineBackdrop>\`s`} (from \`@/components/charts/line-backdrop\`) before the \`<Line>\`, each with the line's \`dataKey\` — they are radial gradients clipped to the region above the line. Copy the \`center\`, \`radius\` and \`stops\` from the reference. ${sceneStep}`,
    `On the \`<Line>\`, set \`strokeGradient={[${palette.line.map((c) => `"${c}"`).join(", ")}]}\`, \`glow={{ blur: ${palette.glow.blur}, opacity: ${palette.glow.opacity} }}\`, \`strokeWidth={2}\` and \`fadeEdges={false}\`, and \`highlight={${fmtHighlight(palette.highlight)}}\` — on hover a soft-ended, glowing segment ${palette.highlight.span} points either side of the cursor stays bright while the rest of the line dims to ${palette.highlight.dimOpacity}; keep \`stroke="${palette.stroke}"\` for the solid fallback.`,
    `On \`<ChartTooltip>\`, set \`showDatePill={false}\`, \`topOffset={16}\` so the panel clears the top edge, a solid crosshair that fades in from the top and stops at the point (\`indicatorEnd="point"\`, \`indicatorColor="${palette.crosshair}"\`, \`indicatorEndColor="${palette.dot}"\`, \`indicatorFadeEdges="top"\`, \`indicatorFadeLength={35}\`) and a glowing dot (\`dotColor="${palette.dot}"\`, \`dotSize={4.5}\`, \`dotHaloScale={2.4}\`, \`dotHaloOpacity={0.7}\`, \`dotHaloBlur={4}\`).`,
    ...(palette.stars.length > 0
      ? [
          `After the glow backdrops, add one more \`<LineBackdrop dataKey>\` whose children are ${palette.stars.length} 3px square \`<rect>\` stars (\`fill="${palette.starColor}"\`, varied \`opacity\`, percentage \`x\`/\`y\` in the top third), so the stars are clipped to the sky and fade in with the glow once the line has drawn.`,
        ]
      : []),
  ];
}

function skyChart(
  component: string,
  Preview: () => React.JSX.Element,
  palette: SkyPalette,
  sceneStep: string
) {
  return {
    id: "line",
    label: "Line",
    rootComponent: "LineChart",
    Preview,
    install: ["line-chart"],
    steps: skySteps(palette, sceneStep),
    code: skySnippet(component, palette),
  };
}

export const skySunset: Recipe = {
  id: "sky-sunset",
  title: "Sunset sky",
  category: "skies",
  description:
    "An orange horizon fading to dusk mauve, with a golden pool where the line turns yellow.",
  look: "a dark dusk scene in either theme: no grid or axes; above the line a radial glow runs warm orange at the horizon through rose to dusky mauve and fades out, with a golden pool on the right. The line runs ember orange → gold → pale yellow with a strong glow, a few faint pixel stars sit in the sky, and hovering brightens the line under the cursor and shows a fading crosshair to a glowing cream dot.",
  charts: [
    skyChart(
      "SunsetSkyChart",
      SunsetSky,
      SUNSET,
      "The first is the orange → mauve sky; the second is the golden pool on the right."
    ),
  ],
};

export const skyAurora: Recipe = {
  id: "sky-aurora",
  title: "Aurora sky",
  category: "skies",
  description:
    "Green, teal and violet curtains of light rising off the line into a polar night.",
  look: "a dark polar-night scene in either theme: no grid or axes; a teal haze along the line and several tall, narrow elliptical glows rising from it like aurora curtains — green on the left, teal and blue in the middle, violet on the right — all clipped above the line. The line runs green → cyan → violet with a strong glow, a few faint stars sit high up, and hovering brightens the line under the cursor and shows a fading crosshair to a glowing mint dot.",
  charts: [
    skyChart(
      "AuroraSkyChart",
      AuroraSky,
      AURORA,
      "The first is a wide horizon haze; the rest are the curtains — keep their `radius.y` much larger than `radius.x` so each reads as a vertical ribbon."
    ),
  ],
};
