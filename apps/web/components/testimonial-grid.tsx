"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { VerifiedIcon } from "@/components/icons/verified";
import { XIcon } from "@/components/icons/x";
import { Button } from "@/components/ui/button";
import {
  type Testimonial,
  testimonialCollapsedCount,
  testimonials,
} from "@/lib/testimonials";
import { cn } from "@/lib/utils";

const collapsedMaxHeight = 520;
const expandEase = [0.23, 1, 0.32, 1] as const;

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

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initials = testimonial.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const hasTweetLink = testimonial.url.includes("/status/");

  return (
    <article className="relative mb-4 break-inside-avoid rounded-xl border border-border bg-card p-4 shadow-sm">
      {hasTweetLink && (
        <Link
          className="absolute top-3.5 right-3.5 text-muted-foreground transition-colors hover:text-foreground"
          href={testimonial.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="sr-only">View on X</span>
          <XIcon className="size-4" />
        </Link>
      )}
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
            {testimonial.author.verified && (
              <VerifiedIcon className="size-3.5 shrink-0 text-[#1d9bf0]" />
            )}
            <span className="text-muted-foreground text-sm">
              {testimonial.author.handle}
            </span>
          </div>
          <p className="mt-2 text-left text-foreground text-sm leading-relaxed">
            {testimonial.content}
          </p>
        </div>
      </div>
    </article>
  );
}

export function TestimonialGrid({
  items = testimonials,
  collapsedCount = testimonialCollapsedCount,
}: {
  items?: Testimonial[];
  collapsedCount?: number;
}) {
  const reducedMotion = useReducedMotion();
  const innerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [height, setHeight] = useState(collapsedMaxHeight);
  const hasMore = items.length > collapsedCount;

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) {
      return;
    }
    const full = el.scrollHeight;
    if (!hasMore) {
      setHeight(full);
      return;
    }
    setHeight(expanded ? full : Math.min(full, collapsedMaxHeight));
  }, [expanded, hasMore]);

  useLayoutEffect(() => {
    const onResize = () => {
      const el = innerRef.current;
      if (!el) {
        return;
      }
      const full = el.scrollHeight;
      if (!hasMore) {
        setHeight(full);
        return;
      }
      setHeight(expanded ? full : Math.min(full, collapsedMaxHeight));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [expanded, hasMore]);

  return (
    <section aria-label="Testimonials" className="relative w-full">
      <motion.div
        animate={{
          height: reducedMotion && expanded ? "auto" : height,
        }}
        className="relative overflow-hidden"
        initial={false}
        transition={{
          duration: reducedMotion ? 0 : 0.5,
          ease: expandEase,
        }}
      >
        <div ref={innerRef}>
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {items.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {hasMore && !expanded && (
          <div className="group/see-more absolute inset-x-0 bottom-0 z-10 flex h-40 items-end justify-center pb-5">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-20% from-background via-background/90 to-transparent"
            />
            <Button
              className={cn(
                "relative z-10 scale-[0.97] opacity-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                "motion-reduce:scale-100 motion-reduce:opacity-100",
                "hover:scale-100 hover:opacity-100",
                "group-hover/see-more:scale-100 group-hover/see-more:opacity-100",
                "focus-visible:scale-100 focus-visible:opacity-100"
              )}
              onClick={() => setExpanded(true)}
              size="lg"
              type="button"
              variant="white"
            >
              See more
            </Button>
          </div>
        )}
      </motion.div>

      {hasMore && expanded && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={() => setExpanded(false)}
            size="lg"
            type="button"
            variant="outline"
          >
            Show less
          </Button>
        </div>
      )}
    </section>
  );
}
