import type { Metadata } from "next";
import { ChangelogView } from "@/components/changelog/changelog-view";
import { JsonLd } from "@/components/seo/json-ld";
import {
  changelogBlogJsonLd,
  changelogPageMetadata,
} from "@/lib/changelog-seo";

export const metadata: Metadata = changelogPageMetadata(1);

export default function ChangelogPage() {
  return (
    <>
      <JsonLd data={changelogBlogJsonLd(1)} />
      <ChangelogView page={1} />
    </>
  );
}
