import { motionSliceFromState } from "./chart-animation";
import {
  REGISTRY_ORIGIN,
  registryJsonUrlForName,
  shadcnAddItem,
  studioShareStudioUrl,
} from "./chart-links";
import { generateStudioCode } from "./codegen";
import { getStudioControlGroups } from "./control-groups";
import { motionTransitionCodegen } from "./motion-codegen";
import { getStudioConfig } from "./registry";
import { studioChartDefaultState } from "./studio-chart-defaults";
import {
  isStudioComponentVisible,
  studioChartRootComponentId,
} from "./studio-component-visibility";
import type { StudioUrlState } from "./studio-parsers";
import { getEffectiveSeriesColor } from "./studio-series-design";
import type {
  ChartSlug,
  StudioComponentDefinition,
  StudioControl,
  StudioControlGroup,
} from "./types";

/** Public agent skill that teaches the registry, imports and chart APIs. */
export const BKLIT_AGENT_SKILL_INSTALL = "npx skills add bklit/bklit-ui";

/** Layout / bookkeeping keys that never describe the chart itself. */
const IGNORED_STATE_KEYS = new Set<keyof StudioUrlState>([
  "chart",
  "frameW",
  "frameH",
  "hiddenComponents",
]);

const MOTION_KEY_RE = /^motion[A-Z]/;
const CAMEL_BOUNDARY_RE = /([a-z0-9])([A-Z])/g;

interface ControlEntry {
  key: keyof StudioUrlState;
  label: string;
  control: StudioControl;
}

interface SettingChange {
  label: string;
  value: string;
}

/** Registry item for the current chart (profit/loss is a line chart mode in Studio). */
export function studioPromptRegistryName(state: StudioUrlState): ChartSlug {
  if (state.chart === "line-chart" && state.lineChartMode === "profitLoss") {
    return "profit-loss-line";
  }
  return state.chart;
}

/** Defaults the chart picker applies — the baseline the prompt diffs against. */
function promptBaselineState(state: StudioUrlState): StudioUrlState {
  return studioChartDefaultState(studioPromptRegistryName(state));
}

function humanizeKey(key: string): string {
  const words = key.replace(CAMEL_BOUNDARY_RE, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function formatValue(value: unknown, control?: StudioControl): string {
  if (typeof value === "boolean") {
    return value ? "on" : "off";
  }
  if (value === "" || value == null) {
    return "none";
  }
  if (control?.type === "select") {
    const option = control.options.find((o) => o.value === String(value));
    if (option && option.label !== option.value) {
      return `${option.label} (\`${option.value}\`)`;
    }
  }
  if (typeof value === "number") {
    const unit = control?.type === "number" ? (control.unit ?? "") : "";
    return `\`${value}${unit}\``;
  }
  return `\`${String(value)}\``;
}

function groupLabel(prefix: string, group: StudioControlGroup) {
  return prefix ? `${prefix} › ${group.title}` : group.title;
}

/**
 * Every control reachable from the chart's sidebar and layer tree, keyed by
 * URL state key. First occurrence wins, so chart-level controls keep their
 * unscoped labels and per-series copies don't relabel shared keys.
 */
function collectControls(
  state: StudioUrlState,
  components: StudioComponentDefinition[]
): Map<keyof StudioUrlState, ControlEntry> {
  const config = getStudioConfig(state.chart);
  const entries = new Map<keyof StudioUrlState, ControlEntry>();
  const add = (prefix: string, groups: StudioControlGroup[]) => {
    for (const group of groups) {
      for (const control of group.controls) {
        if (!entries.has(control.key)) {
          entries.set(control.key, {
            key: control.key,
            label: `${groupLabel(prefix, group)} › ${control.label}`,
            control,
          });
        }
      }
    }
  };

  add("", getStudioControlGroups(config, state));
  for (const component of components) {
    if (isStudioComponentVisible(state, component.id)) {
      add(component.label, component.controlGroups);
    }
  }
  if (config.motionControls?.length) {
    add("", [{ title: "Motion", controls: config.motionControls }]);
  }
  return entries;
}

/** Keys only controlled by hidden layers — irrelevant to the rendered chart. */
function hiddenLayerOnlyKeys(
  state: StudioUrlState,
  components: StudioComponentDefinition[],
  visibleControls: Map<keyof StudioUrlState, ControlEntry>
): Set<keyof StudioUrlState> {
  const keys = new Set<keyof StudioUrlState>();
  for (const component of components) {
    if (isStudioComponentVisible(state, component.id)) {
      continue;
    }
    for (const group of component.controlGroups) {
      for (const control of group.controls) {
        if (!visibleControls.has(control.key)) {
          keys.add(control.key);
        }
      }
    }
  }
  return keys;
}

/** Labelled list of state values that differ from the chart's defaults. */
export function studioPromptSettingChanges(
  state: StudioUrlState
): SettingChange[] {
  const config = getStudioConfig(state.chart);
  const baseline = promptBaselineState(state);
  const components = config.resolveComponents?.(state) ?? [];
  const controls = collectControls(state, components);
  const hiddenLayerKeys = hiddenLayerOnlyKeys(state, components, controls);

  const labelled: SettingChange[] = [];
  const other: SettingChange[] = [];
  for (const key of Object.keys(state) as (keyof StudioUrlState)[]) {
    if (
      IGNORED_STATE_KEYS.has(key) ||
      MOTION_KEY_RE.test(key) ||
      hiddenLayerKeys.has(key) ||
      Object.is(state[key], baseline[key])
    ) {
      continue;
    }
    const entry = controls.get(key);
    if (entry) {
      labelled.push({
        label: entry.label,
        value: formatValue(state[key], entry.control),
      });
    } else {
      other.push({ label: humanizeKey(key), value: formatValue(state[key]) });
    }
  }
  return [...labelled, ...other];
}

function layerLines(
  state: StudioUrlState,
  components: StudioComponentDefinition[]
): string[] {
  const rootId = studioChartRootComponentId(state.chart);
  const baseline = promptBaselineState(state);
  const visible: string[] = [];
  const hidden: string[] = [];
  for (const component of components) {
    if (component.id === rootId) {
      continue;
    }
    const isVisible = isStudioComponentVisible(state, component.id);
    const changed =
      isVisible !== isStudioComponentVisible(baseline, component.id);
    const name = `${component.label}${changed ? " (changed)" : ""}`;
    (isVisible ? visible : hidden).push(name);
  }
  const lines: string[] = [];
  if (visible.length > 0) {
    lines.push(`- Visible: ${visible.join(", ")}`);
  }
  if (hidden.length > 0) {
    lines.push(`- Hidden (do not render): ${hidden.join(", ")}`);
  }
  return lines;
}

function seriesLines(
  state: StudioUrlState,
  components: StudioComponentDefinition[]
): string[] {
  const rootId = studioChartRootComponentId(state.chart);
  return components
    .filter(
      (component) =>
        component.id !== rootId &&
        component.design?.seriesIndex != null &&
        isStudioComponentVisible(state, component.id)
    )
    .map((component) => {
      const index = component.design?.seriesIndex ?? 0;
      return `- ${component.label}: \`${getEffectiveSeriesColor(state, index)}\``;
    });
}

function codeBlock(lang: string, code: string): string {
  return `\`\`\`${lang}\n${code.trim()}\n\`\`\``;
}

/**
 * Natural-language prompt an AI coding agent can paste to recreate the exact
 * Studio configuration: install steps, every non-default setting, layer
 * visibility, motion, and the generated code as a reference.
 */
export function generateStudioPrompt(
  state: StudioUrlState,
  options: { origin?: string } = {}
): string {
  const config = getStudioConfig(state.chart);
  const { code, data, title } = generateStudioCode(state.chart, state);
  const registryName = studioPromptRegistryName(state);
  const components = config.resolveComponents?.(state) ?? [];
  const changes = studioPromptSettingChanges(state);
  const layers = layerLines(state, components);
  const series = seriesLines(state, components);
  const studioUrl = studioShareStudioUrl(
    state,
    options.origin ?? REGISTRY_ORIGIN
  );

  const sections: string[] = [
    `Add a Bklit UI ${title} to my project that matches the configuration below exactly. It was designed in Bklit Studio: ${studioUrl}`,
    [
      "## Setup",
      "",
      `1. If the Bklit UI agent skill isn't installed yet, install it so you know the registry, file layout and chart APIs: \`${BKLIT_AGENT_SKILL_INSTALL}\``,
      `2. Install the chart from the shadcn registry: \`npx shadcn@latest add ${shadcnAddItem(registryName)}\` (if the \`@bklit\` namespace isn't configured, use \`npx shadcn@latest add ${registryJsonUrlForName(registryName)}\`). Install any other \`@bklit\` items the reference code imports.`,
      "3. The reference code imports from `@bklitui/ui/charts`. Rewrite those imports to wherever the CLI installed the files (usually `@/components/charts/...`), and read the installed source to confirm prop names.",
    ].join("\n"),
    [
      "## Settings changed from the defaults",
      "",
      changes.length > 0
        ? changes.map((c) => `- ${c.label}: ${c.value}`).join("\n")
        : "- None — this is the default Studio configuration.",
    ].join("\n"),
  ];

  if (layers.length > 0) {
    sections.push(["## Layers", "", ...layers].join("\n"));
  }
  if (series.length > 0) {
    sections.push(["## Series colors", "", ...series].join("\n"));
  }
  if (config.motionPanel) {
    const motion = [
      "## Motion",
      "",
      `- Enter transition: \`${motionTransitionCodegen(motionSliceFromState(state))}\``,
    ];
    if (config.motionStagger) {
      motion.push(`- Stagger scale: \`${state.motionStaggerScale}\``);
    }
    motion.push(
      "- Wire this into the chart's enter animation if the reference code doesn't already set it."
    );
    sections.push(motion.join("\n"));
  }

  sections.push(["## Reference code", "", codeBlock("tsx", code)].join("\n"));
  if (data) {
    sections.push(
      [
        "## Data shape",
        "",
        "Use this example data (or map my real data to the same shape):",
        "",
        codeBlock("tsx", data),
      ].join("\n")
    );
  }
  sections.push(
    "Keep the result visually identical to the Studio preview: don't add layers, props or styling that aren't listed above."
  );

  return `${sections.join("\n\n")}\n`;
}

/** Prompt for applying catalog theme tokens (shadcn or chart CSS variables). */
export function generateThemeTokensPrompt({
  cssBlock,
  resolvedTheme,
  tokenGroup,
}: {
  cssBlock: string;
  resolvedTheme: "light" | "dark";
  tokenGroup: "shadcn" | "chart";
}): string {
  const tokens =
    tokenGroup === "chart" ? "Bklit chart theme tokens" : "shadcn theme tokens";
  return `${[
    `Apply these ${tokens} to my project's ${resolvedTheme} mode so my Bklit UI charts match the theme I designed in the Bklit catalog.`,
    [
      "## Setup",
      "",
      `1. If the Bklit UI agent skill isn't installed yet, install it so you know how Bklit charts read theme variables: \`${BKLIT_AGENT_SKILL_INSTALL}\``,
      `2. Find where the project defines its ${resolvedTheme} mode CSS variables (usually \`globals.css\`, or \`bklit-tokens.css\` if it exists) and update each variable below in place. Add any that are missing; don't touch other variables.`,
    ].join("\n"),
    ["## Tokens", "", codeBlock("css", cssBlock)].join("\n"),
  ].join("\n\n")}\n`;
}
