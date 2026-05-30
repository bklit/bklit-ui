import { AbsoluteFill, Img, useCurrentFrame } from "remotion";

export interface StudioCaptureCompositionProps {
  frames: string[];
  width: number;
  height: number;
}

export function StudioCaptureComposition({
  frames,
  width,
  height,
}: StudioCaptureCompositionProps) {
  const frame = useCurrentFrame();
  const src = frames[frame] ?? frames.at(-1) ?? "";

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {src ? (
        <Img
          height={height}
          src={src}
          style={{
            objectFit: "fill",
            imageRendering: "auto",
          }}
          width={width}
        />
      ) : null}
    </AbsoluteFill>
  );
}
