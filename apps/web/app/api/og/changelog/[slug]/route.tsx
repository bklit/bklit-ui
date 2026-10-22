import { notFound } from "next/navigation";
import { getChangelogEntries, getChangelogEntry } from "@/lib/changelog";
import { changelogOgImage } from "@/lib/changelog-og";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getChangelogEntries().map((entry) => ({ slug: entry.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const entry = getChangelogEntry((await params).slug);
  if (!entry) {
    notFound();
  }
  return changelogOgImage({
    entry,
    title: entry.title,
    eyebrow: "Bklit UI Changelog",
  });
}
