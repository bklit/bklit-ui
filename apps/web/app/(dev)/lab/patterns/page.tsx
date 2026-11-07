import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PatternLabClient } from "./pattern-lab-client";

/**
 * Hidden pattern lab: every `PatternPreset` shipped in `@bklitui/ui/charts`
 * (cells re-authored from Nucleo's free SVG patterns, nucleoapp.com/svg-patterns)
 * rendered as an `AreaChart` fill, with tile scale / opacity / colour controls.
 *
 * Same visibility as `/lab/regression`: local + Vercel previews, 404 on prod.
 */
export const metadata: Metadata = {
  title: "Pattern lab",
  robots: { index: false, follow: false },
};

export default function PatternLabPage() {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-6 py-8">
      <PatternLabClient />
    </main>
  );
}
