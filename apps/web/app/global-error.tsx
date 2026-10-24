"use client";

import "./globals.css";
import { useEffect } from "react";
import { SITE_NAME } from "@/lib/site-name";

/**
 * Last-resort boundary: replaces the root layout when it throws, so it ships
 * its own `<html>` / `<body>` and stays dependency-light (no providers,
 * charts, header or fonts — any of those could be what failed).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    // No theme provider here: mirror next-themes' stored choice by hand.
    try {
      const stored = window.localStorage.getItem("theme");
      const dark =
        stored === "dark" ||
        ((stored === null || stored === "system") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      // Storage can throw (privacy mode); keep the light default.
    }
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{`Something went wrong | ${SITE_NAME}`}</title>
        <meta content="noindex" name="robots" />
      </head>
      {/* System font: the root layout's next/font variables aren't loaded here. */}
      <body
        className="flex min-h-screen flex-col bg-sidebar text-foreground antialiased"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <p
            aria-hidden
            className="select-none font-bold text-[clamp(5rem,20vw,10rem)] text-foreground/20 leading-none tracking-tight"
          >
            Oops
          </p>
          <h1 className="mt-6 max-w-xl text-balance font-bold text-3xl sm:text-4xl">
            <span className="sr-only">Error: </span>
            Something went wrong
          </h1>
          <p className="mt-3 max-w-md text-pretty text-muted-foreground">
            {SITE_NAME} hit an unexpected error while loading. Try again, or
            head back home.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 font-medium text-primary-foreground text-sm hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              onClick={() => reset()}
              type="button"
            >
              Try again
            </button>
            {/* Plain <a>: a full reload is the point when the root layout broke. */}
            <a
              className="inline-flex h-10 items-center rounded-lg border border-input bg-popover px-4 font-medium text-foreground text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              href="/"
            >
              Back home
            </a>
          </div>
          {error.digest ? (
            <p className="mt-6 font-mono text-muted-foreground text-xs">
              Reference: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
