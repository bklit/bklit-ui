const showcaseImageTransform = {
  rotateX: 30,
  rotateY: -5,
  rotateZ: -15,
  scale: 1.5,
} as const;

const showcaseHoverScale = 1.6;

export function getShowcaseImageTransform(hovered: boolean): string {
  const scale = hovered ? showcaseHoverScale : showcaseImageTransform.scale;

  return `rotateX(${showcaseImageTransform.rotateX}deg) rotateY(${showcaseImageTransform.rotateY}deg) rotateZ(${showcaseImageTransform.rotateZ}deg) scale(${scale})`;
}
