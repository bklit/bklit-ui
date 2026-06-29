"use client";

import dynamic from "next/dynamic";

const StudioDemoPageClient = dynamic(
  () =>
    import("./studio-demo-page-client").then((mod) => mod.StudioDemoPageClient),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background"
      />
    ),
  }
);

export function StudioDemoPageShell() {
  return <StudioDemoPageClient />;
}
