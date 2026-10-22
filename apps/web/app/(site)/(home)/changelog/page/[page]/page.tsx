import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ChangelogView } from "@/components/changelog/changelog-view";
import { JsonLd } from "@/components/seo/json-ld";
import { getChangelogPageCount } from "@/lib/changelog";
import {
  changelogBlogJsonLd,
  changelogPageMetadata,
} from "@/lib/changelog-seo";

interface Props {
  params: Promise<{ page: string }>;
}

const pageNumberPattern = /^\d+$/;

async function resolvePage(params: Props["params"]): Promise<number> {
  const { page } = await params;
  const number = pageNumberPattern.test(page) ? Number(page) : Number.NaN;
  if (number === 1) {
    permanentRedirect("/changelog");
  }
  if (!(number > 1 && number <= getChangelogPageCount())) {
    notFound();
  }
  return number;
}

/** Older entries, 20 per page; page 1 lives at `/changelog`. */
export default async function ChangelogPaginatedPage({ params }: Props) {
  const page = await resolvePage(params);
  return (
    <>
      <JsonLd data={changelogBlogJsonLd(page)} />
      <ChangelogView page={page} />
    </>
  );
}

export function generateStaticParams() {
  return Array.from({ length: getChangelogPageCount() - 1 }, (_, index) => ({
    page: String(index + 2),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return changelogPageMetadata(await resolvePage(params));
}
