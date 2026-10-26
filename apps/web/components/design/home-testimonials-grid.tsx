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
import { DesignTestimonialPanel } from "./testimonial-panel";

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
      decoding="async"
      height={40}
      loading="lazy"
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
          className="absolute top-5 right-5 z-10 text-muted-foreground transition-colors hover:text-foreground sm:top-6 sm:right-6"
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

  return (
    <section aria-label="Testimonials" className="w-full">
      <div className="columns-1 gap-4 md:columns-2 lg:columns-3 lg:gap-6">
        {visibleItems.map((testimonial) => (
          <DesignTestimonialPanel
            className="mb-4 break-inside-avoid lg:mb-6"
            key={testimonial.id}
          >
            <TestimonialPanelContent testimonial={testimonial} />
          </DesignTestimonialPanel>
        ))}
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-4">
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
