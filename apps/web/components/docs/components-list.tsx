import Link from "next/link";
import { source } from "@/lib/source";

export function ComponentsList() {
  // Get pages directly from source
  const pages = source
    .getPages()
    .filter((page) => page.slugs[0] === "components" && page.slugs.length > 1)
    .sort((a, b) => (a.data.title ?? "").localeCompare(b.data.title ?? ""));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20">
      {pages.map((page) => (
        <Link
          className="font-medium text-lg underline-offset-4 hover:underline md:text-base"
          href={page.url}
          key={page.url}
        >
          {page.data.title}
        </Link>
      ))}
    </div>
  );
}
