export const EDITOR_MOBILE_CHART_ASPECT_RATIO = 4 / 3;

export function fitSizeToAspectRatio(
  maxWidth: number,
  maxHeight: number,
  aspectRatio: number,
  minWidth = 240,
  minHeight = 180
): { width: number; height: number } {
  let width = maxWidth;
  let height = width / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  width = Math.round(width);
  height = Math.round(height);

  if (width < minWidth) {
    width = minWidth;
    height = Math.round(width / aspectRatio);
  }
  if (height < minHeight) {
    height = minHeight;
    width = Math.round(height * aspectRatio);
  }

  if (width > maxWidth) {
    width = Math.round(maxWidth);
    height = Math.round(width / aspectRatio);
  }
  if (height > maxHeight) {
    height = Math.round(maxHeight);
    width = Math.round(height * aspectRatio);
  }

  return { width, height };
}
