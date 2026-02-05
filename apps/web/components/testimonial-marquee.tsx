"use client";

import { motion, useAnimationControls } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { type Testimonial, testimonials } from "@/lib/testimonials";

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
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-medium text-muted-foreground text-sm">
        {fallback}
      </div>
    );
  }

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: onError handler for fallback
    // biome-ignore lint/performance/noImgElement: using img for onError fallback pattern
    <img
      alt={alt}
      className="h-10 w-10 rounded-full object-cover"
      height={40}
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
    .join("");

  return (
    <div className="w-[340px] shrink-0 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar
          alt={testimonial.author.name}
          fallback={initials}
          src={testimonial.author.avatar}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate font-semibold text-foreground text-sm">
              {testimonial.author.name}
            </span>
            <span className="truncate text-muted-foreground text-sm">
              {testimonial.author.handle}
            </span>
            <span className="text-muted-foreground text-sm">·</span>
          </div>
          <p className="mt-1 text-left text-foreground text-sm leading-relaxed">
            {testimonial.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialMarquee({
  items = testimonials,
  direction = "ltr",
  duration = 60,
}: {
  items?: Testimonial[];
  direction?: "ltr" | "rtl";
  /** Duration in seconds for one complete scroll cycle */
  duration?: number;
}) {
  const controls = useAnimationControls();
  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items];
  const offset = (340 + 16) * items.length;

  const startAnimation = useCallback(() => {
    controls.start({
      x: direction === "ltr" ? -offset : 0,
      transition: {
        duration,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      },
    });
  }, [controls, direction, duration, offset]);

  const handleMouseEnter = () => {
    controls.stop();
  };

  const handleMouseLeave = () => {
    startAnimation();
  };

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: hover-to-pause UX pattern
    <section
      aria-label="Testimonials"
      className="w-full overflow-hidden py-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={controls}
        className="flex gap-4"
        initial={{ x: direction === "ltr" ? 0 : -offset }}
      >
        {duplicatedItems.map((testimonial, index) => (
          <TestimonialCard
            key={`${testimonial.id}-${index}`}
            testimonial={testimonial}
          />
        ))}
      </motion.div>
    </section>
  );
}
