import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/design/site-shell";
import { StatusPage } from "@/components/design/status-page";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * Root-level so it handles every unmatched URL and every `notFound()` call.
 * It renders outside the `(site)` layout, so it brings its own `SiteShell`.
 */
export default function NotFound() {
  return (
    <SiteShell>
      <StatusPage
        actions={
          <>
            <Button render={<Link href="/" />} size="lg">
              Back home
            </Button>
            <Button
              render={<Link href="/charts" />}
              size="lg"
              variant="outline"
            >
              Browse charts
            </Button>
          </>
        }
        code="404"
        description="This page doesn't exist or has moved. Head back home, or browse the charts to find what you were after."
        srCode="Error 404:"
        title="Not the chart you're looking for"
      />
    </SiteShell>
  );
}
