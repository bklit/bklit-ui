import { chartLabels } from "@bklitui/studio";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { generateMetadata as chartPageMetadata } from "@/app/(site)/(home)/charts/[chart]/page";
import {
  type ChartSlug,
  isChartSlug,
  validChartSlugs,
} from "@/components/charts/chart-slugs";
import { OgPreviewImage, ReloadAllButton } from "./og-preview-client";
import { withVersion } from "./with-version";

/**
 * Dev-only preview of every `/charts/[chart]` Open Graph image.
 *
 * Image URLs come from the chart page's own `generateMetadata`, so this shows
 * exactly what social cards fetch. `notFound()` in production; noindex and
 * excluded from the sitemap.
 */
export const metadata: Metadata = {
  title: "Chart OG preview",
  robots: { index: false, follow: false },
};

const PAGE_PATH = "/charts/og-preview";

interface SocialImage {
  url: string;
  alt?: string;
}

interface ChartOgEntry {
  slug: ChartSlug;
  label: string;
  title: string;
  description: string;
  ogImage: SocialImage | null;
  twitterImage: SocialImage | null;
  twitterCard: string | null;
}

function firstImage(images: unknown): SocialImage | null {
  const first = Array.isArray(images) ? images[0] : images;
  if (!first) {
    return null;
  }
  if (typeof first === "string" || first instanceof URL) {
    return { url: first.toString() };
  }
  const image = first as { url: string | URL; alt?: string };
  return { url: image.url.toString(), alt: image.alt };
}

async function chartOgEntry(slug: ChartSlug): Promise<ChartOgEntry> {
  const meta = await chartPageMetadata({
    params: Promise.resolve({ chart: slug }),
  });
  const twitter = meta.twitter as
    | { card?: string; images?: unknown }
    | undefined;
  return {
    slug,
    label: chartLabels[slug],
    title: String(meta.openGraph?.title ?? meta.title ?? slug),
    description: String(meta.openGraph?.description ?? meta.description ?? ""),
    ogImage: firstImage(meta.openGraph?.images),
    twitterImage: firstImage(twitter?.images),
    twitterCard: twitter?.card ?? null,
  };
}

function previewHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams(
    Object.entries(params).filter(
      (entry): entry is [string, string] => !!entry[1]
    )
  ).toString();
  return search ? `${PAGE_PATH}?${search}` : PAGE_PATH;
}

interface PageProps {
  searchParams: Promise<{ slug?: string; v?: string }>;
}

export default async function ChartOgPreviewPage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { slug, v = "" } = await searchParams;
  const focusSlug = slug && isChartSlug(slug) ? slug : null;
  const entries = await Promise.all(
    (focusSlug ? [focusSlug] : validChartSlugs).map(chartOgEntry)
  );

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl">
            {focusSlug ? (
              <>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href={previewHref({ v })}
                >
                  Chart OG preview
                </Link>{" "}
                / {chartLabels[focusSlug]}
              </>
            ) : (
              "Chart OG preview"
            )}
          </h1>
          <p className="text-muted-foreground text-sm">
            {focusSlug
              ? "Large view and approximate social card crops."
              : `${entries.length} chart pages. Images use the URLs from each page's metadata (og:image / twitter:image). Dev only.`}
          </p>
        </div>
        <Suspense fallback={null}>
          <ReloadAllButton />
        </Suspense>
      </header>

      {focusSlug && entries[0] ? (
        <FocusView entry={entries[0]} version={v} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {entries.map((entry) => (
            <GridCard entry={entry} key={entry.slug} version={v} />
          ))}
        </div>
      )}
    </main>
  );
}

function TwitterMismatch({ entry }: { entry: ChartOgEntry }) {
  const issues: string[] = [];
  if (!entry.ogImage) {
    issues.push("no og:image");
  }
  if (!entry.twitterImage) {
    issues.push("no twitter:image");
  } else if (entry.ogImage && entry.twitterImage.url !== entry.ogImage.url) {
    issues.push("twitter:image differs from og:image");
  }
  if (entry.twitterCard !== "summary_large_image") {
    issues.push(`twitter:card is ${entry.twitterCard ?? "unset"}`);
  }
  if (issues.length === 0) {
    return null;
  }
  return (
    <p className="text-amber-600 text-xs dark:text-amber-400">
      {issues.join(" · ")}
    </p>
  );
}

function GridCard({
  entry,
  version,
}: {
  entry: ChartOgEntry;
  version: string;
}) {
  return (
    <article className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-medium">
          <Link
            className="hover:underline"
            href={previewHref({ slug: entry.slug, v: version })}
          >
            {entry.label}
          </Link>
        </h2>
        <div className="flex items-center gap-3 text-muted-foreground text-xs">
          <code>{entry.slug}</code>
          <Link
            className="hover:text-foreground hover:underline"
            href={`/charts/${entry.slug}`}
          >
            Page
          </Link>
          <Link
            className="hover:text-foreground hover:underline"
            href={previewHref({ slug: entry.slug, v: version })}
          >
            Focus
          </Link>
        </div>
      </div>
      {entry.ogImage ? (
        <OgPreviewImage
          alt={entry.ogImage.alt ?? entry.title}
          key={version}
          src={entry.ogImage.url}
          version={version}
        />
      ) : null}
      <TwitterMismatch entry={entry} />
    </article>
  );
}

const SITE_DOMAIN = "bklit.com";

function FocusView({
  entry,
  version,
}: {
  entry: ChartOgEntry;
  version: string;
}) {
  if (!entry.ogImage) {
    return <TwitterMismatch entry={entry} />;
  }
  const src = withVersion(entry.ogImage.url, version);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
          <Link
            className="hover:text-foreground hover:underline"
            href={`/charts/${entry.slug}`}
          >
            /charts/{entry.slug}
          </Link>
          <span>·</span>
          <span>{entry.title}</span>
        </div>
        <div className="max-w-[1200px]">
          <OgPreviewImage
            alt={entry.ogImage.alt ?? entry.title}
            className="size-full object-contain"
            key={version}
            src={entry.ogImage.url}
            version={version}
          />
        </div>
        <dl className="grid max-w-[1200px] grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
          <dt className="text-muted-foreground">og:image</dt>
          <dd className="break-all font-mono">{entry.ogImage.url}</dd>
          <dt className="text-muted-foreground">twitter:image</dt>
          <dd className="break-all font-mono">
            {entry.twitterImage?.url === entry.ogImage.url
              ? "same as og:image"
              : (entry.twitterImage?.url ?? "none")}
          </dd>
          <dt className="text-muted-foreground">twitter:card</dt>
          <dd className="font-mono">{entry.twitterCard ?? "none"}</dd>
          <dt className="text-muted-foreground">alt</dt>
          <dd>{entry.ogImage.alt ?? "none"}</dd>
          <dt className="text-muted-foreground">description</dt>
          <dd>{entry.description}</dd>
        </dl>
        <TwitterMismatch entry={entry} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium text-lg">Card layouts (approximate)</h2>
        <div className="flex flex-wrap items-start gap-8">
          <CardFrame label="X / Twitter (summary_large_image)">
            <div className="w-[506px]">
              <div className="relative aspect-[1.91/1] overflow-hidden rounded-2xl border border-neutral-700">
                <SocialImg src={src} />
                <span className="absolute bottom-3 left-3 rounded bg-black/70 px-1.5 py-0.5 text-[13px] text-white">
                  {entry.title}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-neutral-500">
                From {SITE_DOMAIN}
              </p>
            </div>
          </CardFrame>

          <CardFrame label="LinkedIn">
            <div className="w-[552px] overflow-hidden rounded-lg border border-neutral-200 bg-white text-neutral-900">
              <div className="aspect-[1.91/1] overflow-hidden">
                <SocialImg src={src} />
              </div>
              <div className="px-3 py-2">
                <p className="line-clamp-2 font-semibold text-sm">
                  {entry.title}
                </p>
                <p className="text-neutral-500 text-xs">{SITE_DOMAIN}</p>
              </div>
            </div>
          </CardFrame>

          <CardFrame label="Slack unfurl">
            <div className="flex w-[440px] gap-3 rounded bg-white p-3 text-neutral-900">
              <div className="w-1 shrink-0 rounded bg-neutral-300" />
              <div className="flex min-w-0 flex-col gap-1">
                <p className="font-bold text-sm">Bklit UI</p>
                <p className="font-bold text-[#1264a3] text-sm">
                  {entry.title}
                </p>
                <p className="line-clamp-3 text-sm">{entry.description}</p>
                <div className="mt-1 aspect-[1200/630] w-[360px] overflow-hidden rounded-lg">
                  <SocialImg src={src} />
                </div>
              </div>
            </div>
          </CardFrame>

          <CardFrame label="Discord embed">
            <div className="flex w-[432px] overflow-hidden rounded bg-[#2b2d31] text-[#dbdee1]">
              <div className="w-1 shrink-0 bg-[#1e1f22]" />
              <div className="flex min-w-0 flex-col gap-2 p-4">
                <p className="text-xs">Bklit UI</p>
                <p className="font-semibold text-[#00a8fc]">{entry.title}</p>
                <p className="line-clamp-3 text-sm">{entry.description}</p>
                <div className="aspect-[1200/630] w-full overflow-hidden rounded">
                  <SocialImg src={src} />
                </div>
              </div>
            </div>
          </CardFrame>

          <CardFrame label="Square centre crop (X summary, WhatsApp, compact previews)">
            <div className="flex w-[440px] items-center gap-3 overflow-hidden rounded-xl border border-neutral-700">
              <div className="size-32 shrink-0 overflow-hidden">
                <SocialImg src={src} />
              </div>
              <div className="min-w-0 py-2 pr-3">
                <p className="text-neutral-500 text-xs">{SITE_DOMAIN}</p>
                <p className="line-clamp-2 text-sm">{entry.title}</p>
              </div>
            </div>
          </CardFrame>
        </div>
      </section>
    </div>
  );
}

function CardFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-muted-foreground text-xs">{label}</figcaption>
      {children}
    </figure>
  );
}

function SocialImg({ src }: { src: string }) {
  return (
    // biome-ignore lint/performance/noImgElement: preview the exact OG response, no image optimizer
    <img
      alt=""
      className="size-full object-cover object-center"
      height={630}
      src={src}
      width={1200}
    />
  );
}
