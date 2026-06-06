import { Suspense } from "react";
import { StudioOgPreviewClient } from "./studio-og-preview-client";

export default function StudioOgPreviewPage() {
  return (
    <Suspense fallback={null}>
      <StudioOgPreviewClient />
    </Suspense>
  );
}
