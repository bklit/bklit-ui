import {
  CHOROPLETH_ZOOM_EASES,
  parseChoroplethMarkers,
} from "./choropleth-studio-options";
import { backgroundPropsCodegen } from "./codegen-helpers";
import type { StudioUrlState } from "./studio-parsers";

function cameraView(
  view: string,
  yaw: number,
  tilt: number,
  defaults: { view: string }
) {
  const parts: string[] = [];
  if (view !== defaults.view) {
    parts.push(`view: "${view}"`);
  }
  if (view !== "flat" && yaw !== 18) {
    parts.push(`yaw: ${yaw}`);
  }
  if (tilt !== 0) {
    parts.push(`tilt: ${tilt}`);
  }
  return parts.length > 0 ? `{ ${parts.join(", ")} }` : null;
}

function clickZoomProps(state: StudioUrlState): string[] {
  if (!state.choroplethClickZoom) {
    return [];
  }
  const props = ["clickToZoom"];
  const ease = state.choroplethZoomEase;
  const transition: string[] = [];
  if (state.choroplethZoomDuration !== 700) {
    transition.push(`duration: ${state.choroplethZoomDuration}`);
  }
  if (ease !== "inOutQuint") {
    transition.push(`ease: [${CHOROPLETH_ZOOM_EASES[ease].join(", ")}]`);
  }
  if (transition.length > 0) {
    props.push(`zoomTransition={{ ${transition.join(", ")} }}`);
  }
  if (state.choroplethFocusMaxZoom !== 6) {
    props.push(`focusMaxZoom={${state.choroplethFocusMaxZoom}}`);
  }
  return props;
}

/** Extra `<ChoroplethChart>` props for click-to-zoom and the 3D camera. */
export function choroplethChartPropsCodegen(state: StudioUrlState): string {
  const props = clickZoomProps(state);
  const overview = cameraView(
    state.choroplethOverviewView,
    state.choroplethOverviewYaw,
    state.choroplethOverviewTilt,
    { view: "flat" }
  );
  const focus = state.choroplethClickZoom
    ? cameraView(
        state.choroplethFocusView,
        state.choroplethFocusYaw,
        state.choroplethFocusTilt,
        { view: "" }
      )
    : null;
  if (overview || focus) {
    const perspective = [
      overview ? `overview: ${overview}` : "",
      focus ? `focus: ${focus}` : "",
      state.choroplethDepth === 1600 ? "" : `depth: ${state.choroplethDepth}`,
      state.choroplethEdgeFade === 0
        ? ""
        : `edgeFade: ${state.choroplethEdgeFade}`,
    ].filter(Boolean);
    props.push(`perspective={{ ${perspective.join(", ")} }}`);
  }
  return props.length > 0 ? ` ${props.join(" ")}` : "";
}

export function choroplethBackgroundCodegen(state: StudioUrlState): string {
  if (!state.choroplethBackground || state.backgroundPattern === "none") {
    return "";
  }
  const hide = state.choroplethHideContextOnFocus ? " hideOnFocus" : "";
  return `\n  <ChoroplethBackground${backgroundPropsCodegen(state)}${hide} />`;
}

export function choroplethDotGridCodegen(
  state: StudioUrlState,
  colorProp: string
): string {
  const props: string[] = [];
  if (state.choroplethDotGap !== 7) {
    props.push(`gap={${state.choroplethDotGap}}`);
  }
  if (state.choroplethDotSize !== 0.7) {
    props.push(`dotSize={${state.choroplethDotSize}}`);
  }
  if (state.choroplethDotZoomSize !== 0.9) {
    props.push(`zoomDotSize={${state.choroplethDotZoomSize}}`);
  }
  if (!state.choroplethHideContextOnFocus) {
    props.push("hideOceanOnFocus={false}");
  }
  if (state.choroplethDotLattice !== "hex") {
    props.push(`lattice="${state.choroplethDotLattice}"`);
  }
  if (!state.choroplethDotOcean) {
    props.push("showOcean={false}");
  } else if (state.choroplethDotOceanOpacity !== 0.55) {
    props.push(`oceanOpacity={${state.choroplethDotOceanOpacity}}`);
  }
  if (state.choroplethDotEdgeFade !== 12) {
    props.push(`edgeFade={${state.choroplethDotEdgeFade}}`);
  }
  if (state.choroplethFeatureFadedOpacity !== 0.4) {
    props.push(`fadedOpacity={${state.choroplethFeatureFadedOpacity}}`);
  }
  return `\n  <ChoroplethDotGrid${colorProp}${props.length > 0 ? ` ${props.join(" ")}` : ""} />`;
}

export function choroplethMarkersCodegen(state: StudioUrlState): string {
  if (!state.choroplethShowMarkers) {
    return "";
  }
  const shared: string[] = [];
  if (state.choroplethMarkerShape !== "circle") {
    shared.push(`shape="${state.choroplethMarkerShape}"`);
  }
  if (state.choroplethMarkerSize !== 9) {
    shared.push(`size={${state.choroplethMarkerSize}}`);
  }
  if (state.choroplethMarkerColor !== "var(--foreground)") {
    shared.push(`color="${state.choroplethMarkerColor}"`);
  }
  if (state.choroplethMarkerPulse !== "hover") {
    shared.push(`pulse="${state.choroplethMarkerPulse}"`);
  }
  if (state.choroplethMarkerGlow > 0) {
    shared.push(`glow={${state.choroplethMarkerGlow}}`);
  }
  if (state.choroplethMarkerLabels) {
    shared.push("showLabel");
  }
  if (state.choroplethMarkerStroke) {
    shared.push(`stroke="${state.choroplethMarkerStrokeColor}"`);
    if (state.choroplethMarkerStrokeWidth !== 1.5) {
      shared.push(`strokeWidth={${state.choroplethMarkerStrokeWidth}}`);
    }
  }
  const sharedProps = shared.length > 0 ? ` ${shared.join(" ")}` : "";
  return parseChoroplethMarkers(state.choroplethMarkers)
    .map(
      ({ label, coordinates: [lon, lat] }) =>
        `\n  <ChoroplethMarker coordinates={[${lon}, ${lat}]} label=${JSON.stringify(label)}${sharedProps} />`
    )
    .join("");
}
