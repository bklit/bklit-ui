import type { Metadata } from "next";
import {
  studioOgImagePath,
  studioPageMetadata,
} from "@/lib/studio-page-metadata";
import { StudioPageClient } from "./studio-page-client";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  return studioPageMetadata(params);
}

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const ogImagePath = studioOgImagePath(params);

  return (
    <>
      <link as="image" href={ogImagePath} rel="prefetch" />
      <StudioPageClient />
    </>
  );
}
