import defaultMdxComponents from "fumadocs-ui/mdx";
import Link from "next/link";
import type { ComponentProps } from "react";
import { ChangelogImage } from "@/components/changelog/changelog-image";
import type { ChangelogEntry } from "@/lib/changelog";
import { formatChangelogDate } from "@/lib/changelog-format";

type ImageSource = string | { src: string } | undefined;

/** fumadocs image (next/image for local and static-import sources). */
const MdxImage = defaultMdxComponents.img;

/** Markdown `![alt](/changelog/…svg)` → masked cover art; other images as-is. */
function ArticleImage(props: ComponentProps<typeof MdxImage>) {
  const src = props.src as ImageSource;
  const url = typeof src === "string" ? src : src?.src;
  if (url?.endsWith(".svg")) {
    return <ChangelogImage alt={props.alt} className="my-8" src={url} />;
  }
  return <MdxImage {...props} />;
}

// Plain headings: many entries share one page, so anchor ids would collide.
function ArticleH2(props: ComponentProps<"h2">) {
  return <h2 {...props} />;
}

function ArticleH3(props: ComponentProps<"h3">) {
  return <h3 {...props} />;
}

export function ChangelogArticle({
  entry,
  headingAs: Heading = "h2",
}: {
  entry: ChangelogEntry;
  /** `h1` for the entry a permalink opens on. */
  headingAs?: "h1" | "h2";
}) {
  const MDX = entry.body;

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          className="w-fit text-muted-foreground text-sm tabular-nums transition-colors hover:text-foreground"
          href={entry.url}
        >
          <time dateTime={entry.date}>{formatChangelogDate(entry.date)}</time>
        </Link>
        <Heading className="text-balance font-heading font-semibold text-2xl text-foreground lg:text-3xl">
          <Link className="hover:underline-offset-4" href={entry.url}>
            {entry.title}
          </Link>
        </Heading>
      </header>
      {entry.image ? (
        <ChangelogImage alt={entry.imageAlt ?? ""} src={entry.image} />
      ) : null}
      <div className="docs-prose changelog-prose prose prose-neutral dark:prose-invert max-w-none">
        <MDX
          components={{
            ...defaultMdxComponents,
            h2: ArticleH2,
            h3: ArticleH3,
            img: ArticleImage,
            ChangelogImage,
          }}
        />
      </div>
    </article>
  );
}
