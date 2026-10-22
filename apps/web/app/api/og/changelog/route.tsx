import { getChangelogEntries } from "@/lib/changelog";
import { changelogOgImage } from "@/lib/changelog-og";

export const runtime = "nodejs";
export const dynamic = "force-static";

/** `/changelog` card — the latest entry's artwork. */
export function GET() {
  return changelogOgImage({
    entry: getChangelogEntries()[0],
    title: "Changelog",
    eyebrow: "Bklit UI",
  });
}
