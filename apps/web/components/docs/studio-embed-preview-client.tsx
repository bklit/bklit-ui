export function StudioEmbedPreviewClient({
  src,
  height,
}: {
  src: string;
  height: number;
}) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-border shadow-sm">
      <iframe
        className="block w-full border-0"
        height={height}
        loading="lazy"
        src={src}
        title="Bklit Studio chart demo"
      />
    </div>
  );
}
