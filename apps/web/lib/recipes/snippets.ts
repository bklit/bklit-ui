/**
 * Source fragments shared by several recipe snippets. Keep `VERTICAL_FADE_SOURCE`
 * in sync with `components/recipes/vertical-fade.tsx` (the preview version).
 */

/** Top/bottom fade zone used by every pattern-background recipe (% of plot height). */
export const PATTERN_FADE_EDGE = 33;

export const VERTICAL_FADE_SOURCE = `/** Fades its children in over the top and bottom \`edge\`% of the plot. */
function VerticalFade({
  children,
  edge = ${PATTERN_FADE_EDGE},
}: {
  children: ReactNode;
  edge?: number;
}) {
  const { innerWidth, innerHeight } = useChartStable();
  const id = useId().replace(/:/g, "");

  if (innerWidth <= 0 || innerHeight <= 0) {
    return null;
  }

  return (
    <g>
      <defs>
        <linearGradient id={\`\${id}-fade\`} x1="0" x2="0" y1="0" y2="1">
          <stop offset={0} stopColor="white" stopOpacity={0} />
          <stop offset={edge / 100} stopColor="white" />
          <stop offset={1 - edge / 100} stopColor="white" />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </linearGradient>
        <mask
          height={innerHeight}
          id={\`\${id}-mask\`}
          maskUnits="userSpaceOnUse"
          width={innerWidth}
          x={0}
          y={0}
        >
          <rect
            fill={\`url(#\${id}-fade)\`}
            height={innerHeight}
            width={innerWidth}
          />
        </mask>
      </defs>
      <g mask={\`url(#\${id}-mask)\`}>{children}</g>
    </g>
  );
}`;

/** Prompt step describing the `VerticalFade` helper. */
export const VERTICAL_FADE_STEP = `Add the small \`VerticalFade\` helper from the reference below (once — e.g. \`components/charts/vertical-fade.tsx\`, exporting it). It reads \`innerWidth\` / \`innerHeight\` from \`useChartStable()\` in \`@/components/charts/chart-context\` and wraps its children in an SVG \`<mask>\` whose vertical \`linearGradient\` runs transparent → opaque at ${PATTERN_FADE_EDGE}% → opaque at ${100 - PATTERN_FADE_EDGE}% → transparent, so the pattern is solid through the middle and fades out over the top and bottom thirds.`;
