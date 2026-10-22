import { getChangelogEntries } from "@/lib/changelog";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-static";

const xmlSpecialPattern = /[<>&'"]/g;
const xmlEntities: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  "'": "&apos;",
  '"': "&quot;",
};

function escapeXml(value: string): string {
  return value.replace(xmlSpecialPattern, (char) => xmlEntities[char] ?? char);
}

/** RSS 2.0 feed of every changelog entry, newest first. */
export function GET() {
  const entries = getChangelogEntries();
  const items = entries
    .map((entry) => {
      const url = absoluteUrl(entry.url);
      return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(entry.timestamp).toUTCString()}</pubDate>
      ${entry.description ? `<description>${escapeXml(entry.description)}</description>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} Changelog</title>
    <link>${absoluteUrl("/changelog")}</link>
    <description>New charts, primitives and fixes shipped to ${SITE_NAME}.</description>
    <language>en</language>
    <atom:link href="${absoluteUrl("/changelog/rss.xml")}" rel="self" type="application/rss+xml"/>
${entries[0] ? `    <lastBuildDate>${new Date(entries[0].timestamp).toUTCString()}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
