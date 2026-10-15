import { Frame, FramePanel } from "@/components/ui/frame";

export function StudioEmbedPreviewClient({
  src,
  height,
}: {
  src: string;
  height: number;
}) {
  return (
    <Frame className="not-prose my-8">
      <FramePanel className="overflow-hidden p-0">
        <iframe
          className="block w-full border-0"
          height={height}
          loading="lazy"
          src={src}
          title="Bklit Studio chart demo"
        />
      </FramePanel>
    </Frame>
  );
}
