export const PATTERN_PRESET_IDS = [
  "none",
  "diagonal",
  "horizontal",
  "vertical",
  "cross",
  "dots",
  "accent",
] as const;

export type PatternPresetId = (typeof PATTERN_PRESET_IDS)[number];

export const PATTERN_PRESETS: {
  id: PatternPresetId;
  label: string;
  previewClass?: string;
}[] = [
  { id: "none", label: "Solid" },
  { id: "diagonal", label: "Diagonal" },
  { id: "horizontal", label: "Horizontal" },
  { id: "vertical", label: "Vertical" },
  { id: "cross", label: "Cross" },
  { id: "dots", label: "Dots" },
  { id: "accent", label: "Accent" },
];
