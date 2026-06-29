import type { RepoRelativePath } from "@/lib/open-in-cursor";

const STUDIO = "packages/studio/src";
const UI = `${STUDIO}/ui`;
const CONTROLS = `${STUDIO}/components/controls`;
const COMPONENTS = `${STUDIO}/components`;
const EDITOR = `${STUDIO}/editor`;

/** Source files backing each catalog tile (repo-root-relative paths). */
export const CATALOG_TILE_SOURCES: Record<string, RepoRelativePath[]> = {
  chrome: [
    `${COMPONENTS}/studio-control-group.tsx`,
    `${COMPONENTS}/studio-scramble-data-button.tsx`,
    `${CONTROLS}/motion-reset-button.tsx`,
    `${CONTROLS}/slider-input-group.tsx`,
    `${STUDIO}/editor/editor-data-section.tsx`,
    `${STUDIO}/editor/editor-animation-section.tsx`,
  ],
  surfaces: [`${COMPONENTS}/chart-type-selector.tsx`],
  "menu-bar": [
    `${EDITOR}/editor-menu-bar.tsx`,
    `${EDITOR}/editor-sidebar-toggle.tsx`,
    `${EDITOR}/editor-replay-button.tsx`,
    `${COMPONENTS}/studio-toolbar-tooltips.tsx`,
    `${UI}/button.tsx`,
  ],
  canvas: [
    `${EDITOR}/editor-canvas.tsx`,
    `${EDITOR}/editor-canvas-world-grid.tsx`,
    `${EDITOR}/editor-grida-rulers.tsx`,
    `${EDITOR}/use-editor-canvas-view.ts`,
    `${EDITOR}/editor-camera.ts`,
    `${STUDIO}/styles/bklit-tokens.css`,
  ],
  "components-tree": [
    `${COMPONENTS}/studio-components-panel.tsx`,
    `${STUDIO}/lib/studio-components.ts`,
    `${STUDIO}/lib/studio-component-tree-icon.ts`,
    `${STUDIO}/lib/studio-component-visibility.ts`,
    `${UI}/context-menu.tsx`,
  ],
  "slider-input": [
    `${CONTROLS}/slider-input-group.tsx`,
    `${CONTROLS}/scrub-number-field.tsx`,
    `${UI}/number-field.tsx`,
  ],
  "custom-controls": [
    `${UI}/yes-no-switch.tsx`,
    `${UI}/studio-slider.tsx`,
    `${CONTROLS}/scrub-number-field.tsx`,
  ],
  "motion-full": [
    `${CONTROLS}/motion-control.tsx`,
    `${CONTROLS}/studio-toggle-group.tsx`,
    `${CONTROLS}/motion-curve-editor.tsx`,
    `${UI}/studio-slider.tsx`,
    `${CONTROLS}/motion-ease-preset-grid.tsx`,
  ],
  "motion-bezier": [`${CONTROLS}/motion-curve-editor.tsx`],
  "motion-presets": [
    `${CONTROLS}/motion-ease-preset-grid.tsx`,
    `${CONTROLS}/studio-toggle-group.tsx`,
  ],
  "toggle-groups": [
    `${CONTROLS}/studio-toggle-group.tsx`,
    `${UI}/segmented-control.tsx`,
    `${UI}/toggle-group.tsx`,
  ],
  fields: [
    `${CONTROLS}/control-field-helpers.tsx`,
    `${CONTROLS}/opacity-control.tsx`,
    `${CONTROLS}/fill-picker.tsx`,
    `${CONTROLS}/scrub-number-field.tsx`,
  ],
  "chart-pickers": [
    `${CONTROLS}/curve-picker.tsx`,
    `${CONTROLS}/line-cap-picker.tsx`,
    `${CONTROLS}/orientation-picker.tsx`,
    `${CONTROLS}/chart-state-toggle.tsx`,
  ],
  pickers: [`${CONTROLS}/legend-position-picker.tsx`],
  patterns: [`${CONTROLS}/pattern-picker.tsx`],
  "color-picker": [
    `${CONTROLS}/studio-color-picker.tsx`,
    `${UI}/color-picker/oklch-color-area.tsx`,
    `${UI}/color-picker/oklch-color-slider.tsx`,
  ],
  primitives: [
    `${UI}/button.tsx`,
    `${UI}/input.tsx`,
    `${UI}/textarea.tsx`,
    `${UI}/select.tsx`,
    `${UI}/switch.tsx`,
  ],
  overlays: [`${UI}/dialog.tsx`, `${UI}/sheet.tsx`, `${UI}/popover.tsx`],
  "shimmer-text": ["packages/ui/src/components/shimmering-text.tsx"],
  feedback: [`${UI}/alert.tsx`, `${UI}/spinner.tsx`, `${UI}/tooltip.tsx`],
};
