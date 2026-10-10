export type BarValueLabelOrientation = "auto" | "horizontal" | "vertical";
export type BarValueLabelPosition = "top" | "center" | "bottom";

export function getBarValueLabelLayout({
  x,
  y,
  width,
  height,
  labelWidth,
  isHorizontal,
  orientation,
  position,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  labelWidth: number;
  isHorizontal: boolean;
  orientation: BarValueLabelOrientation;
  position: BarValueLabelPosition;
}) {
  const normalFits =
    width >= labelWidth + 10 && (isHorizontal ? height >= 22 : height >= 24);
  const rotatedFits =
    height >= labelWidth + 10 && (isHorizontal ? width >= 22 : width >= 24);
  let fits = normalFits || rotatedFits;
  if (orientation === "horizontal") {
    fits = normalFits;
  } else if (orientation === "vertical") {
    fits = rotatedFits;
  }

  let labelY = y + height / 2;
  if (position === "top") {
    labelY = y + 14;
  } else if (position === "bottom") {
    labelY = y + height - 8;
  }

  return {
    fits,
    rotated:
      fits &&
      (orientation === "vertical" || (orientation === "auto" && !normalFits)),
    x: x + width / 2,
    y: labelY,
  };
}
