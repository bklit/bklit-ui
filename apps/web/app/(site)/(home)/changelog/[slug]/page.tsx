import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChangelogView } from "@/components/changelog/changelog-view";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getChangelogEntries,
  getChangelogEntry,
  getChangelogPageForSlug,
} from "@/lib/changelog";
import {
  changelogEntryJsonLd,
  changelogEntryMetadata,
} from "@/lib/changelog-seo";
import { breadcrumbJsonLd } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Permalink: the entry's page of the feed, opened at this entry. */
export default async function ChangelogEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = getChangelogEntry(slug);
  if (!entry) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          changelogEntryJsonLd(entry),
          breadcrumbJsonLd([
            { name: "Changelog", path: "/changelog" },
            { name: entry.title, path: entry.url },
          ]),
        ]}
      />
      <ChangelogView
        initialSlug={entry.slug}
        page={getChangelogPageForSlug(entry.slug)}
      />
    </>
  );
}

export function generateStaticParams() {
  return getChangelogEntries().map((entry) => ({ slug: entry.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = getChangelogEntry((await params).slug);
  return entry ? changelogEntryMetadata(entry) : {};
}
