import { DotGridBackground } from "@/components/design/dot-grid-background";

const siteLeftDotGridFadeClass =
  "[mask-image:linear-gradient(to_right,black_0%,transparent_100%)]";

export function SiteLeftDotGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 left-0 z-0 w-[300px]"
    >
      <DotGridBackground className={siteLeftDotGridFadeClass} />
    </div>
  );
}
