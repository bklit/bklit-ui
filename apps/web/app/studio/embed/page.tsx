import type { Metadata } from "next";
import { studioEmbedPageMetadata } from "@/lib/studio-embed-page-metadata";
import { StudioEmbedPageClient } from "./studio-embed-page-client";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  return studioEmbedPageMetadata(params);
}

export default function StudioEmbedPage() {
  return <StudioEmbedPageClient />;
}
