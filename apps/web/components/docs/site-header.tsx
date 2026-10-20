"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChartThemeSelector } from "@/components/chart-theme/chart-theme-selector";
import {
  siteContainerClassName,
  siteRailsClassName,
} from "@/components/design/site-chrome";
import { ModeToggle } from "@/components/mode-toggle";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import { cn } from "@/lib/utils";
import { GithubStarCount } from "../github-star-count";
import { BklitLogo } from "../icons/bklit";
import { DiscordIcon } from "../icons/discord";
import { GitHubIcon } from "../icons/github";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetPanel,
  SheetPopup,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { DocsSearchTrigger } from "./docs-search-trigger";
import { NavLinkLabel } from "./nav-link-label";

function trackDiscordClick(location: "header" | "mobile_menu") {
  trackEvent("discord_click", {
    location,
    url: getAnalyticsUrl(),
  });
}

interface NavLink {
  text: string;
  url: string;
  active?: "url" | "nested-url";
}

interface SiteHeaderProps {
  links?: NavLink[];
  githubUrl?: string;
  discordUrl?: string;
}

const guides = [
  { text: "Theming", url: "/docs/theming" },
  { text: "Skills", url: "/docs/skills" },
];

const components = [
  { text: "Area Chart", url: "/docs/components/area-chart" },
  { text: "Bar Chart", url: "/docs/components/bar-chart" },
  { text: "Candlestick Chart", url: "/docs/components/candlestick-chart" },
  { text: "Choropleth Chart", url: "/docs/components/choropleth-chart" },
  { text: "Composed Chart", url: "/docs/components/composed-chart" },
  { text: "Funnel Chart", url: "/docs/components/funnel-chart" },
  { text: "Gauge", url: "/docs/components/gauge-chart" },
  { text: "Heatmap Chart", url: "/docs/components/heatmap-chart" },
  { text: "Line Chart", url: "/docs/components/line-chart" },
  { text: "Profit/Loss Line", url: "/docs/components/profit-loss-line" },
  { text: "Live Line Chart", url: "/docs/components/live-line-chart" },
  { text: "Pie Chart", url: "/docs/components/pie-chart" },
  { text: "Radar Chart", url: "/docs/components/radar-chart" },
  { text: "Ring Chart", url: "/docs/components/ring-chart" },
  { text: "Scatter Chart", url: "/docs/components/scatter-chart" },
  { text: "Sankey Chart", url: "/docs/components/sankey-chart" },
  { text: "Sunburst Chart", url: "/docs/components/sunburst-chart" },
];

const utilities = [
  { text: "Legend", url: "/docs/utility/legend" },
  { text: "Grid", url: "/docs/utility/grid" },
  { text: "Background", url: "/docs/utility/background" },
  { text: "Reference Area", url: "/docs/utility/reference-area" },
  { text: "Projection Line", url: "/docs/utility/projection-line" },
  { text: "Trend Line", url: "/docs/utility/trend-line" },
  { text: "Markers", url: "/docs/utility/markers" },
  { text: "Tooltip", url: "/docs/utility/tooltip" },
  { text: "Brush", url: "/docs/utility/brush" },
  {
    text: "Axis",
    children: [
      { text: "X Axis", url: "/docs/utility/axis/x-axis" },
      { text: "Y Axis", url: "/docs/utility/axis/y-axis" },
    ],
  },
  { text: "Custom Indicator", url: "/docs/utility/custom-indicator" },
  { text: "useChart", url: "/docs/utility/use-chart" },
];

function isNavLinkActive(pathname: string | null, url: string) {
  if (!pathname) {
    return false;
  }
  if (pathname === url || pathname.startsWith(`${url}/`)) {
    return true;
  }
  // Section links that point at a default child page (e.g. /charts/area-chart).
  const section = url.split("/")[1];
  return (
    (section === "charts" || section === "studio") &&
    pathname.startsWith(`/${section}`)
  );
}

/** Mobile nav — coss ui's left drawer (https://coss.com/ui, MIT). */
function MobileMenuSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="font-medium text-sm">{title}</div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function MobileLink({
  href,
  active,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { active?: boolean }) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-sm py-1.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        active && "text-foreground",
        className
      )}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}

interface MobileMenuProps {
  links: NavLink[];
  githubUrl?: string;
  discordUrl?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MobileMenu({
  links,
  githubUrl,
  discordUrl,
  open,
  onOpenChange,
}: MobileMenuProps) {
  const pathname = usePathname();
  const onClose = () => onOpenChange(false);

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetTrigger
        render={
          <Button
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative -ms-1.5 size-8 lg:hidden"
            size="icon"
            variant="ghost"
          />
        }
      >
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M4 8.5h16" />
          <path d="M4 15.5h16" />
        </svg>
      </SheetTrigger>
      <SheetPopup side="left">
        <SheetPanel
          className="flex flex-col gap-12 p-6 pt-8"
          scrollFade={false}
        >
          <div className="flex flex-col gap-3">
            <SheetTitle className="font-medium font-sans text-sm leading-normal">
              Menu
            </SheetTitle>
            <div className="flex flex-col gap-0.5">
              {links.map((link) => (
                <MobileLink
                  active={isNavLinkActive(pathname, link.url)}
                  href={link.url}
                  key={link.url}
                  onClick={onClose}
                >
                  <NavLinkLabel text={link.text} url={link.url} />
                </MobileLink>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <MobileMenuSection title="Guides">
              {guides.map((guide) => (
                <MobileLink
                  active={pathname === guide.url}
                  href={guide.url}
                  key={guide.url}
                  onClick={onClose}
                >
                  {guide.text}
                </MobileLink>
              ))}
            </MobileMenuSection>

            <MobileMenuSection title="Components">
              {components.map((component) => (
                <MobileLink
                  active={pathname === component.url}
                  href={component.url}
                  key={component.url}
                  onClick={onClose}
                >
                  {component.text}
                </MobileLink>
              ))}
            </MobileMenuSection>

            <MobileMenuSection title="Utility">
              {utilities.map((utility) =>
                "children" in utility && utility.children ? (
                  <div className="flex flex-col" key={utility.text}>
                    <span className="py-1.5 text-muted-foreground/72">
                      {utility.text}
                    </span>
                    <div className="ms-1 flex flex-col border-border/64 border-s ps-3">
                      {utility.children.map((child) => (
                        <MobileLink
                          active={pathname === child.url}
                          href={child.url}
                          key={child.url}
                          onClick={onClose}
                        >
                          {child.text}
                        </MobileLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <MobileLink
                    active={pathname === utility.url}
                    href={utility.url}
                    key={utility.url}
                    onClick={onClose}
                  >
                    {utility.text}
                  </MobileLink>
                )
              )}
            </MobileMenuSection>

            {githubUrl || discordUrl ? (
              <MobileMenuSection title="Community">
                {githubUrl ? (
                  <MobileLink
                    aria-label="GitHub"
                    href={githubUrl}
                    onClick={onClose}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <GitHubIcon className="size-4" />
                    <span>GitHub</span>
                    <span className="text-muted-foreground/72 text-xs tabular-nums">
                      <GithubStarCount />
                    </span>
                  </MobileLink>
                ) : null}
                {discordUrl ? (
                  <MobileLink
                    aria-label="Discord"
                    href={discordUrl}
                    onClick={() => {
                      trackDiscordClick("mobile_menu");
                      onClose();
                    }}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <DiscordIcon className="size-4" />
                    <span>Discord</span>
                  </MobileLink>
                ) : null}
              </MobileMenuSection>
            ) : null}
          </div>
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  );
}

export function SiteHeader({
  links = [],
  githubUrl,
  discordUrl,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const { resolvedTheme } = useTheme();

  // Wait for mount to avoid hydration mismatch with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${header.getBoundingClientRect().height}px`
      );
    };

    syncHeaderHeight();
    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  // Only use resolved theme after mount to avoid hydration mismatch
  const logoTheme = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 w-full bg-sidebar/80 backdrop-blur-sm before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border/64"
      ref={headerRef}
      style={{ viewTransitionName: "site-header" }}
    >
      <div
        className={cn(
          siteContainerClassName,
          // Same rails as the page frame below, so the header reads as part of
          // the framed column (coss ui draws one rail layer through both).
          siteRailsClassName,
          "relative flex h-16 items-center justify-between gap-2"
        )}
      >
        <MobileMenu
          discordUrl={discordUrl}
          githubUrl={githubUrl}
          links={links}
          onOpenChange={setMobileMenuOpen}
          open={mobileMenuOpen}
        />

        {/* Wordmark — coss ui's "coss.com ui" treatment */}
        <Link
          aria-label="Home"
          className="flex shrink-0 items-center gap-1.5 font-bold font-heading text-[1.375em] text-foreground tracking-tight no-underline sm:text-2xl"
          href="/"
        >
          <BklitLogo className="me-0.5" size={22} theme={logoTheme} />
          <span>Bklit</span>
          <span className="text-muted-foreground/64">UI</span>
        </Link>

        <div className="ms-auto flex items-center gap-2 md:flex-1 md:justify-end">
          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 lg:flex">
            {links.map((link) => {
              const active = isNavLinkActive(pathname, link.url);
              return (
                <Button
                  data-pressed={active || undefined}
                  key={link.url}
                  render={
                    <Link
                      aria-current={active ? "page" : undefined}
                      href={link.url}
                    />
                  }
                  variant="ghost"
                >
                  <NavLinkLabel text={link.text} url={link.url} />
                </Button>
              );
            })}
          </nav>

          <div className="mx-2 hidden md:flex">
            <DocsSearchTrigger hideIfDisabled />
          </div>

          <Separator className="h-5 max-md:hidden" orientation="vertical" />

          {githubUrl ? (
            <Button
              aria-label="GitHub"
              className="relative hidden h-8 shadow-none md:inline-flex"
              render={
                <Link
                  href={githubUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                />
              }
              size="sm"
              variant="ghost"
            >
              <GitHubIcon className="size-4" />
              <span className="text-muted-foreground text-xs tabular-nums empty:hidden">
                <GithubStarCount />
              </span>
            </Button>
          ) : null}
          {discordUrl ? (
            <Button
              aria-label="Discord"
              className="relative hidden size-8 md:inline-flex"
              onClick={() => trackDiscordClick("header")}
              render={
                <Link
                  href={discordUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                />
              }
              size="icon"
              variant="ghost"
            >
              <DiscordIcon className="size-4" />
            </Button>
          ) : null}
          <ChartThemeSelector />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
