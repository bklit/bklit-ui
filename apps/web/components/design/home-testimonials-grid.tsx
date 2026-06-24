"use client";

import Link from "next/link";
import { useState } from "react";
import { VerifiedIcon } from "@/components/icons/verified";
import { XIcon } from "@/components/icons/x";
import { Button } from "@/components/ui/button";
import {
  type Testimonial,
  testimonialCollapsedCount,
  testimonials,
} from "@/lib/testimonials";
import { GridCornerDots } from "./line-grid";
import { DesignTestimonialPanel } from "./testimonial-panel";

const columnsPerRow = 3;

function Avatar({
  src,
  alt,
  fallback,
}: {
  src: string;
  alt: string;
  fallback: string;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground text-sm">
        {fallback}
      </div>
    );
  }

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: onError handler for fallback
    // biome-ignore lint/performance/noImgElement: using img for onError fallback pattern
    <img
      alt={alt}
      className="h-10 w-10 shrink-0 rounded-full object-cover"
      height={40}
      onError={() => setError(true)}
      src={src}
      width={40}
    />
  );
}

function TestimonialPanelContent({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  const initials = testimonial.author.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2);

  const hasTweetLink = testimonial.url.includes("/status/");

  return (
    <>
      {hasTweetLink ? (
        <Link
          className="absolute top-8 right-8 z-10 text-muted-foreground transition-colors hover:text-foreground"
          href={testimonial.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="sr-only">View on X</span>
          <XIcon className="size-3" />
        </Link>
      ) : null}
      <div className="flex items-start gap-3 pr-6">
        <Avatar
          alt={testimonial.author.name}
          fallback={initials}
          src={testimonial.author.avatar}
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5">
            <span className="font-semibold text-foreground text-sm">
              {testimonial.author.name}
            </span>
            {testimonial.author.verified ? (
              <VerifiedIcon className="size-3.5 shrink-0 text-[#1d9bf0]" />
            ) : null}
            <span className="text-muted-foreground text-sm">
              {testimonial.author.handle}
            </span>
          </div>
          <p className="mt-2 text-left text-foreground text-sm leading-relaxed">
            {testimonial.content}
          </p>
        </div>
      </div>
    </>
  );
}

export function HomeTestimonialsGrid({
  items = testimonials,
  collapsedCount = testimonialCollapsedCount,
}: {
  items?: Testimonial[];
  collapsedCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > collapsedCount;
  const visibleItems = expanded ? items : items.slice(0, collapsedCount);
  const desktopRows = Math.ceil(visibleItems.length / columnsPerRow);

  return (
    <section aria-label="Testimonials" className="w-full">
      <div className="relative w-full overflow-visible border-border border-t border-l">
        <div className="grid grid-cols-1 overflow-visible md:grid-cols-3">
          {visibleItems.map((testimonial) => (
            <DesignTestimonialPanel className="min-w-0" key={testimonial.id}>
              <TestimonialPanelContent testimonial={testimonial} />
            </DesignTestimonialPanel>
          ))}
        </div>
        <GridCornerDots
          className="z-3 md:hidden"
          columns={1}
          rows={visibleItems.length}
        />
        <GridCornerDots
          className="z-3 hidden md:block"
          columns={columnsPerRow}
          rows={desktopRows}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          data-grid-rulers
        >
          <div className="absolute -top-8 left-0 block h-10 w-px bg-muted-foreground/40" />
          <div className="absolute top-0 -left-8 block h-px w-10 bg-muted-foreground/40" />
          <div className="absolute -top-8 right-0 block h-10 w-px bg-muted-foreground/40" />
          <div className="absolute top-0 -right-8 block h-px w-10 bg-muted-foreground/40" />

          <div className="absolute -bottom-8 left-0 block h-10 w-px bg-muted-foreground/40" />
          <div className="absolute bottom-0 -left-8 block h-px w-10 bg-muted-foreground/40" />
          <div className="absolute right-0 -bottom-8 block h-10 w-px bg-muted-foreground/40" />
          <div className="absolute -right-8 bottom-0 block h-px w-10 bg-muted-foreground/40" />

          <div className="absolute -top-8 -right-8 block h-6 w-6 bg-[repeating-linear-gradient(45deg,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_0,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_1px,transparent_0,transparent_50%)] bg-size-[5px_5px] bg-fixed opacity-80" />
          <div className="absolute -bottom-8 -left-8 block h-6 w-6 bg-[repeating-linear-gradient(45deg,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_0,color-mix(in_oklch,var(--muted-foreground)_40%,transparent)_1px,transparent_0,transparent_50%)] bg-size-[5px_5px] bg-fixed opacity-80" />
        </div>
      </div>

      {hasMore ? (
        <div className="flex justify-center py-8">
          <Button
            onClick={() => setExpanded((value) => !value)}
            size="lg"
            type="button"
            variant="outline"
          >
            {expanded ? "Show less" : "See more"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
