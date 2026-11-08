/** Click-to-zoom easing presets (move-on-screen curves + two ease-outs). */
export const CHOROPLETH_ZOOM_EASES = {
  inOutQuint: [0.83, 0, 0.17, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
  inOutCubic: [0.65, 0, 0.35, 1],
  outExpo: [0.16, 1, 0.3, 1],
  drawer: [0.32, 0.72, 0, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

export type ChoroplethZoomEaseId = keyof typeof CHOROPLETH_ZOOM_EASES;

export const CHOROPLETH_ZOOM_EASE_IDS = Object.keys(
  CHOROPLETH_ZOOM_EASES
) as ChoroplethZoomEaseId[];

export const CHOROPLETH_ZOOM_EASE_OPTIONS: {
  value: ChoroplethZoomEaseId;
  label: string;
}[] = [
  { value: "inOutQuint", label: "Ease in-out (quint)" },
  { value: "inOutQuart", label: "Ease in-out (quart)" },
  { value: "inOutCubic", label: "Ease in-out (cubic)" },
  { value: "outExpo", label: "Ease out (expo)" },
  { value: "drawer", label: "Drawer" },
];

/** `Label lat,lon` entries separated by `;`. */
export const DEFAULT_CHOROPLETH_MARKERS =
  "London 51.51,-0.13; Paris 48.86,2.35; New York 40.71,-74.01; Tokyo 35.69,139.69; São Paulo -23.55,-46.63; Sydney -33.87,151.21";

export interface StudioChoroplethMarker {
  label: string;
  /** `[longitude, latitude]` */
  coordinates: [number, number];
}

const MARKER_ENTRY = /^(.*?)\s+(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/;

/** Parses the Studio marker text field; skips entries it can't read. */
export function parseChoroplethMarkers(raw: string): StudioChoroplethMarker[] {
  const markers: StudioChoroplethMarker[] = [];
  for (const entry of raw.split(";")) {
    const match = MARKER_ENTRY.exec(entry.trim());
    if (!match) {
      continue;
    }
    const [, label, latText, lonText] = match;
    const lat = Number(latText);
    const lon = Number(lonText);
    if (
      label &&
      Math.abs(lat) <= 85 &&
      Math.abs(lon) <= 180 &&
      !markers.some((m) => m.label === label)
    ) {
      markers.push({ label, coordinates: [lon, lat] });
    }
  }
  return markers;
}
