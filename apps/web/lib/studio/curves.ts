import {
  curveBasis,
  curveCatmullRom,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
} from "@visx/curve";

export const CURVE_IDS = [
  "natural",
  "monotoneX",
  "linear",
  "step",
  "basis",
  "catmullRom",
] as const;

export type CurveId = (typeof CURVE_IDS)[number];

export const composedHeroSmoothCurve = curveCatmullRom.alpha(0.42);

export const CURVE_OPTIONS: {
  value: CurveId;
  label: string;
  curve: typeof curveNatural;
}[] = [
  { value: "natural", label: "Natural", curve: curveNatural },
  { value: "monotoneX", label: "Monotone X", curve: curveMonotoneX },
  { value: "linear", label: "Linear", curve: curveLinear },
  { value: "step", label: "Step", curve: curveStep },
  { value: "basis", label: "Basis", curve: curveBasis },
  {
    value: "catmullRom",
    label: "Catmull–Rom",
    curve: composedHeroSmoothCurve,
  },
];

export function resolveCurve(id: CurveId) {
  return CURVE_OPTIONS.find((o) => o.value === id)?.curve ?? curveNatural;
}

export function curveImportName(id: CurveId): string {
  const map: Record<CurveId, string> = {
    natural: "curveNatural",
    monotoneX: "curveMonotoneX",
    linear: "curveLinear",
    step: "curveStep",
    basis: "curveBasis",
    catmullRom: "curveCatmullRom",
  };
  return map[id];
}
