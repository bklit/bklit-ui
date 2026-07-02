import type { StudioControl, StudioControlGroup } from "./types";

/** Wrap controls in a titled sidebar section. */
export function controlGroup(
  title: string,
  controls: StudioControl[],
  options?: { collapsible?: boolean; defaultOpen?: boolean }
): StudioControlGroup {
  return { title, controls, ...options };
}

export const designGroup = (controls: StudioControl[]) =>
  controlGroup("Design", controls);

/** Collapsible group for bar chart sidebar sections. */
export function barCollapsibleGroup(
  title: string,
  controls: StudioControl[],
  defaultOpen = false
): StudioControlGroup {
  return controlGroup(title, controls, { collapsible: true, defaultOpen });
}

/** Expand the first N collapsible groups in a sidebar panel (bar chart default). */
export function expandFirstCollapsible(
  groups: StudioControlGroup[],
  count = 2
): StudioControlGroup[] {
  let seen = 0;
  return groups.map((group) => {
    if (group.collapsible && seen < count) {
      seen += 1;
      return { ...group, defaultOpen: true };
    }
    return group;
  });
}

export const lineGroup = (controls: StudioControl[]) =>
  controlGroup("Line", controls);

export const axesGroup = (controls: StudioControl[]) =>
  controlGroup("Axes", controls);

/** Standard curve control — use inside Line group. */
export const curveControl = (): StudioControl => ({
  type: "curve",
  key: "curve",
  label: "Curve",
});

/** Standard pattern control — use inside Design group. */
export const patternControl = (): StudioControl => ({
  type: "pattern",
  key: "pattern",
  label: "Pattern",
});

/**
 * "Data" group with series + point count sliders.
 *
 * @param maxSeries - Cap series count (default 10, matches `STUDIO_SERIES_KEYS`).
 */
export const dataGroup = (maxSeries = 10): StudioControlGroup =>
  controlGroup("Data", [
    {
      type: "number",
      key: "dataSeries",
      label: "Series",
      min: 1,
      max: maxSeries,
      step: 1,
    },
    {
      type: "number",
      key: "dataPoints",
      label: "Points",
      min: 3,
      max: 365,
      step: 1,
    },
  ]);
