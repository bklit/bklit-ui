import {
  defaultStudioState,
  STUDIO_EMBED_DEFAULT_HEIGHT,
  studioEmbedHref,
} from "@bklitui/studio";
import type { ChartSlug } from "@/components/charts/chart-slugs";
import { StudioEmbedPreviewClient } from "@/components/docs/studio-embed-preview-client";

export function StudioEmbedPreview({
  chart = "line-chart",
}: {
  chart?: ChartSlug;
}) {
  const src = studioEmbedHref(defaultStudioState({ chart }));

  return (
    <StudioEmbedPreviewClient height={STUDIO_EMBED_DEFAULT_HEIGHT} src={src} />
  );
}
