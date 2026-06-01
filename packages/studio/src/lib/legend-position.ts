import type { StudioUrlState } from "@/lib/studio-parsers";

export const LEGEND_POSITIONS = [
  "top-start",
  "top-center",
  "top-end",
  "bottom-start",
  "bottom-center",
  "bottom-end",
] as const;

export type LegendPositionId = (typeof LEGEND_POSITIONS)[number];

export function legendPositionId(
  placement: StudioUrlState["legendPlacement"],
  align: StudioUrlState["legendAlign"]
): LegendPositionId {
  return `${placement}-${align}`;
}

export function parseLegendPositionId(id: LegendPositionId): {
  placement: StudioUrlState["legendPlacement"];
  align: StudioUrlState["legendAlign"];
} {
  const [placement, align] = id.split("-") as [
    StudioUrlState["legendPlacement"],
    StudioUrlState["legendAlign"],
  ];
  return { placement, align };
}
