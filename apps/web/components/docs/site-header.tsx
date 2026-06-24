"use client";

import Link from "fumadocs-core/link";
import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import { GithubStarCount } from "../github-star-count";
import { BklitLogo } from "../icons/bklit";
import { DiscordIcon } from "../icons/discord";
import { GitHubIcon } from "../icons/github";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
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
];

const utilities = [
  { text: "Legend", url: "/docs/utility/legend" },
  { text: "Grid", url: "/docs/utility/grid" },
  { text: "Background", url: "/docs/utility/background" },
  { text: "Reference Area", url: "/docs/utility/reference-area" },
  { text: "Projection Line", url: "/docs/utility/projection-line" },
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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        className="origin-center transition-all duration-200"
        d={open ? "M18 6L6 18" : "M4 6h16"}
      />
      <path
        className="origin-center transition-all duration-200"
        d="M4 12h16"
        style={{ opacity: open ? 0 : 1 }}
      />
      <path
        className="origin-center transition-all duration-200"
        d={open ? "M6 6l12 12" : "M4 18h16"}
      />
    </svg>
  );
}

const STAGGER_DURATION = 650; // Total duration for all staggered items (ms)

const HEADER_EASE = [0.23, 1, 0.32, 1] as const;
const BORDER_EASE = [0.645, 0.045, 0.355, 1] as const;
const HEADER_SHELL_DURATION = 0.38;
const HEADER_BORDER_DELAY = 0.1;
const HEADER_BORDER_DURATION = 0.32;

interface MobileMenuProps {
  links: NavLink[];
  githubUrl?: string;
  discordUrl?: string;
  isOpen: boolean;
  onClose: () => void;
  staggerDelay: number;
}

function MobileMenu({
  links,
  githubUrl,
  discordUrl,
  isOpen,
  onClose,
  staggerDelay,
}: MobileMenuProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const getBlurStyle = (index: number) => ({
    filter: isOpen ? "blur(0px)" : "blur(2px)",
    transitionDelay: isOpen ? `${index * staggerDelay}ms` : "0ms",
  });

  const componentsStartIndex = links.length + 1;
  const utilitiesLinksCount = utilities.flatMap((u) =>
    "children" in u && u.children ? u.children : [u]
  ).length;
  const utilitiesStartIndex = componentsStartIndex + components.length + 1;
  const externalLinksStartIndex = utilitiesStartIndex + 1 + utilitiesLinksCount; // +1 for Utility header

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 top-(--site-header-height) bottom-0 z-50 flex flex-col overflow-hidden border-border border-b bg-background/95 backdrop-blur-xl transition-all duration-300 ease-out md:hidden ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]">
          {/* Main links */}
          <div className="flex flex-col gap-0.5">
            {links.map((link, index) => (
              <Link
                className="transition-[filter] duration-300 ease-out"
                href={link.url}
                key={link.url}
                onClick={onClose}
                style={getBlurStyle(index)}
              >
                <Button
                  className="h-10 w-full justify-start px-3"
                  size="default"
                  variant="ghost"
                >
                  <NavLinkLabel text={link.text} url={link.url} />
                </Button>
              </Link>
            ))}
          </div>

          {/* Components section */}
          <div className="mt-3 border-border border-t pt-3">
            <span
              className="mb-1 block px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider transition-[filter] duration-300 ease-out"
              style={getBlurStyle(links.length)}
            >
              Components
            </span>
            <div className="flex flex-col gap-0.5">
              {components.map((component, index) => (
                <Link
                  className="transition-[filter] duration-300 ease-out"
                  href={component.url}
                  key={component.url}
                  onClick={onClose}
                  style={getBlurStyle(componentsStartIndex + index)}
                >
                  <Button
                    className="h-10 w-full justify-start px-3"
                    size="default"
                    variant="ghost"
                  >
                    {component.text}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Utility section */}
          <div className="mt-3 border-border border-t pt-3">
            <span
              className="mb-1 block px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider transition-[filter] duration-300 ease-out"
              style={getBlurStyle(utilitiesStartIndex - 1)}
            >
              Utility
            </span>
            <div className="flex flex-col gap-0.5">
              {utilities.flatMap((utility, i) => {
                if ("children" in utility && utility.children) {
                  return [
                    <span
                      className="mt-2 mb-1 block px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider first:mt-0"
                      key={`axis-${utility.text}`}
                      style={getBlurStyle(utilitiesStartIndex + 1 + i)}
                    >
                      {utility.text}
                    </span>,
                    ...utility.children.map((child, j) => (
                      <Link
                        className="pl-4 transition-[filter] duration-300 ease-out"
                        href={child.url}
                        key={child.url}
                        onClick={onClose}
                        style={getBlurStyle(
                          utilitiesStartIndex +
                            2 +
                            utilities
                              .slice(0, i)
                              .flatMap((u) =>
                                "children" in u && u.children ? u.children : [u]
                              ).length +
                            j
                        )}
                      >
                        <Button
                          className="h-10 w-full justify-start px-3"
                          size="default"
                          variant="ghost"
                        >
                          {child.text}
                        </Button>
                      </Link>
                    )),
                  ];
                }
                const flatIndex = utilities
                  .slice(0, i)
                  .flatMap((u) =>
                    "children" in u && u.children ? [1, ...u.children] : [1]
                  ).length;
                return (
                  <Link
                    className="transition-[filter] duration-300 ease-out"
                    href={utility.url}
                    key={utility.url}
                    onClick={onClose}
                    style={getBlurStyle(utilitiesStartIndex + 1 + flatIndex)}
                  >
                    <Button
                      className="h-10 w-full justify-start px-3"
                      size="default"
                      variant="ghost"
                    >
                      {utility.text}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* External links */}
          {(githubUrl || discordUrl) && (
            <div className="mt-3 flex flex-col gap-0.5 border-border border-t pt-3">
              {githubUrl && (
                <Link
                  aria-label="GitHub"
                  className="transition-[filter] duration-300 ease-out"
                  external
                  href={githubUrl}
                  onClick={onClose}
                  style={getBlurStyle(externalLinksStartIndex)}
                >
                  <Button
                    className="w-full justify-start gap-2 font-light font-mono text-muted-foreground text-xs"
                    size="default"
                    variant="ghost"
                  >
                    <GitHubIcon />
                    <span>GitHub</span>
                    <GithubStarCount />
                  </Button>
                </Link>
              )}
              {discordUrl && (
                <Link
                  aria-label="Discord"
                  className="transition-[filter] duration-300 ease-out"
                  external
                  href={discordUrl}
                  onClick={() => {
                    trackDiscordClick("mobile_menu");
                    onClose();
                  }}
                  style={getBlurStyle(
                    externalLinksStartIndex + (githubUrl ? 1 : 0)
                  )}
                >
                  <Button
                    className="w-full justify-start gap-2 text-muted-foreground"
                    size="default"
                    variant="ghost"
                  >
                    <DiscordIcon className="size-4" />
                    <span>Discord</span>
                  </Button>
                </Link>
              )}
            </div>
          )}
        </nav>
      </div>
    </>
  );
}

function HeaderShell({
  isScrolled,
  reducedMotion,
  children,
}: {
  isScrolled: boolean;
  reducedMotion: boolean | null;
  children: ReactNode;
}) {
  const shellTransition = reducedMotion
    ? { duration: 0 }
    : { duration: HEADER_SHELL_DURATION, ease: HEADER_EASE };

  const borderTransition = reducedMotion
    ? { duration: 0 }
    : {
        duration: HEADER_BORDER_DURATION,
        ease: BORDER_EASE,
        delay: isScrolled ? HEADER_BORDER_DELAY : 0,
      };

  return (
    <motion.div
      animate={{
        paddingLeft: isScrolled ? 40 : 0,
        paddingRight: isScrolled ? 40 : 0,
      }}
      className="container mx-auto"
      transition={shellTransition}
    >
      <motion.div
        animate={{
          marginTop: isScrolled ? 16 : 0,
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: isScrolled ? 16 : 0,
          paddingRight: isScrolled ? 16 : 0,
          borderWidth: isScrolled ? 1 : 0,
          borderColor: isScrolled ? "var(--border)" : "transparent",
          backgroundColor: isScrolled
            ? "color-mix(in oklab, var(--background) 80%, transparent)"
            : "transparent",
          backdropFilter: isScrolled ? "blur(4px)" : "blur(0px)",
        }}
        style={{ borderStyle: "solid" }}
        transition={{
          ...shellTransition,
          borderColor: borderTransition,
          borderWidth: reducedMotion
            ? { duration: 0 }
            : {
                duration: HEADER_SHELL_DURATION * 0.7,
                ease: HEADER_EASE,
                delay: isScrolled ? HEADER_BORDER_DELAY * 0.6 : 0,
              },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function SiteHeader({
  links = [],
  githubUrl,
  discordUrl,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();

  // Calculate stagger delay based on total items to complete in STAGGER_DURATION
  const utilitiesCount =
    1 +
    utilities.flatMap((u) =>
      "children" in u && u.children ? [1, ...u.children] : [1]
    ).length;
  const totalItems =
    links.length +
    1 + // Components header
    components.length +
    1 + // Utilities header
    utilitiesCount +
    (githubUrl ? 1 : 0) +
    (discordUrl ? 1 : 0);
  const staggerDelay = totalItems > 1 ? STAGGER_DURATION / (totalItems - 1) : 0;

  // Wait for mount to avoid hydration mismatch with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
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
    <>
      <header
        className="fixed top-0 right-0 left-0 z-50 flex items-center px-2.5"
        ref={headerRef}
        style={{ viewTransitionName: "site-header" }}
      >
        <HeaderShell isScrolled={isScrolled} reducedMotion={reducedMotion}>
          <div className="mx-auto flex h-full items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Link
                className="font-semibold text-foreground text-lg no-underline transition-opacity hover:opacity-80"
                href="/"
              >
                <BklitLogo size={24} theme={logoTheme} />
              </Link>

              {/* Desktop nav */}
              <nav className="hidden items-center gap-1 md:flex">
                {links.map((link) => (
                  <Link href={link.url} key={link.url}>
                    <Button variant="ghost">
                      <NavLinkLabel text={link.text} url={link.url} />
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-1">
              <DocsSearchTrigger
                className="hidden w-30 justify-between md:inline-flex"
                hideIfDisabled
              />
              {githubUrl && (
                <>
                  <Separator
                    className="mx-1 hidden h-5 self-center data-vertical:self-center md:block"
                    orientation="vertical"
                  />
                  <Link
                    aria-label="GitHub"
                    className="hidden md:block"
                    external
                    href={githubUrl}
                  >
                    <Button
                      className="gap-2 font-light font-mono text-muted-foreground text-xs"
                      size="default"
                      variant="ghost"
                    >
                      <GitHubIcon />
                      <GithubStarCount />
                    </Button>
                  </Link>
                </>
              )}
              {discordUrl && (
                <Link
                  aria-label="Discord"
                  className="hidden md:block"
                  external
                  href={discordUrl}
                  onClick={() => trackDiscordClick("header")}
                >
                  <Button size="default" variant="ghost">
                    <DiscordIcon />
                  </Button>
                </Link>
              )}
              <ModeToggle />

              {/* Mobile menu button */}
              <Button
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                size="default"
                variant="ghost"
              >
                <MenuIcon open={mobileMenuOpen} />
              </Button>
            </div>
          </div>
        </HeaderShell>
      </header>

      <MobileMenu
        discordUrl={discordUrl}
        githubUrl={githubUrl}
        isOpen={mobileMenuOpen}
        links={links}
        onClose={() => setMobileMenuOpen(false)}
        staggerDelay={staggerDelay}
      />
    </>
  );
}
