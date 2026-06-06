"use client";

import { StudioOgPreview } from "@bklitui/studio";
import { useSearchParams } from "next/navigation";

export function StudioOgPreviewClient() {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  return <StudioOgPreview search={search} />;
}
