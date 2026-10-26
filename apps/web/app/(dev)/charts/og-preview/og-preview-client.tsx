"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { withVersion } from "./with-version";

/** Sets `?v=<now>` so every image URL changes and the browser refetches. */
export function ReloadAllButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Button
      onClick={() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("v", Date.now().toString(36));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }}
      size="sm"
      variant="outline"
    >
      Reload all images
    </Button>
  );
}

interface OgPreviewImageProps {
  alt: string;
  className?: string;
  /** Real metadata URL (relative, resolved against the dev server). */
  src: string;
  version: string;
  /** Show the per-image reload + open links under the image. */
  withActions?: boolean;
}

export function OgPreviewImage({
  alt,
  className,
  src,
  version,
  withActions = true,
}: OgPreviewImageProps) {
  const [nonce, setNonce] = useState(0);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );
  const resolved = withVersion(src, nonce ? `${version}-${nonce}` : version);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-md border bg-muted">
        {/* biome-ignore lint/performance/noImgElement: preview the exact OG response, no image optimizer */}
        {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: load/error status, not user interaction */}
        <img
          alt={alt}
          className={className ?? "size-full object-cover"}
          height={630}
          key={resolved}
          loading="lazy"
          onError={() => setStatus("error")}
          onLoad={() => setStatus("loaded")}
          // Image may finish loading before hydration attaches onLoad.
          ref={(img) => {
            if (img?.complete) {
              setStatus(img.naturalWidth > 0 ? "loaded" : "error");
            }
          }}
          src={resolved}
          width={1200}
        />
        {status === "loaded" ? null : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            {status === "error" ? "Failed to load image" : "Rendering…"}
          </div>
        )}
      </div>
      {withActions ? (
        <div className="flex items-center gap-3 text-muted-foreground text-xs">
          <button
            className="underline-offset-2 hover:text-foreground hover:underline"
            onClick={() => {
              setStatus("loading");
              setNonce((n) => n + 1);
            }}
            type="button"
          >
            Reload
          </button>
          <a
            className="underline-offset-2 hover:text-foreground hover:underline"
            href={resolved}
            rel="noopener"
            target="_blank"
          >
            Open full size
          </a>
        </div>
      ) : null}
    </div>
  );
}
