"use client";

import Link from "fumadocs-core/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { GithubStarCount } from "../github-star-count";
import { BklitLogo } from "../icons/bklit";
import { DiscordIcon } from "../icons/discord";
import { GitHubIcon } from "../icons/github";
import { Button } from "../ui/button";

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
  { text: "Line Chart", url: "/docs/components/line-chart" },
  { text: "Area Chart", url: "/docs/components/area-chart" },
  { text: "Bar Chart", url: "/docs/components/bar-chart" },
  { text: "Ring Chart", url: "/docs/components/ring-chart" },
  { text: "Pie Chart", url: "/docs/components/pie-chart" },
  { text: "Radar Chart", url: "/docs/components/radar-chart" },
  { text: "Sankey Chart", url: "/docs/components/sankey-chart" },
  { text: "Choropleth Chart", url: "/docs/components/choropleth-chart" },
];

const utilities = [
  { text: "Legend", url: "/docs/utility/legend" },
  { text: "Grid", url: "/docs/utility/grid" },
  { text: "Tooltip", url: "/docs/utility/tooltip" },
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
        className={`fixed top-14 right-0 left-0 z-50 max-h-[calc(100vh-3.5rem)] overflow-y-auto overscroll-contain border-border border-b bg-background/95 backdrop-blur-xl transition-all duration-300 ease-out md:hidden ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
      >
        <nav className="flex flex-col px-6 py-4 pb-8">
          {/* Main links */}
          <div className="flex flex-col gap-1">
            {links.map((link, index) => (
              <Link
                className="transition-[filter] duration-300 ease-out"
                href={link.url}
                key={link.url}
                onClick={onClose}
                style={getBlurStyle(index)}
              >
                <Button
                  className="w-full justify-start"
                  size="sm"
                  variant="ghost"
                >
                  {link.text}
                </Button>
              </Link>
            ))}
          </div>

          {/* Components section */}
          <div className="mt-4 border-border border-t pt-4">
            <span
              className="mb-2 block px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider transition-[filter] duration-300 ease-out"
              style={getBlurStyle(links.length)}
            >
              Components
            </span>
            <div className="flex flex-col gap-1">
              {components.map((component, index) => (
                <Link
                  className="transition-[filter] duration-300 ease-out"
                  href={component.url}
                  key={component.url}
                  onClick={onClose}
                  style={getBlurStyle(componentsStartIndex + index)}
                >
                  <Button
                    className="w-full justify-start"
                    size="sm"
                    variant="ghost"
                  >
                    {component.text}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Utility section */}
          <div className="mt-4 border-border border-t pt-4">
            <span
              className="mb-2 block px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider transition-[filter] duration-300 ease-out"
              style={getBlurStyle(utilitiesStartIndex - 1)}
            >
              Utility
            </span>
            <div className="flex flex-col gap-1">
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
                          className="w-full justify-start"
                          size="sm"
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
                      className="w-full justify-start"
                      size="sm"
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
            <div className="mt-4 flex flex-col gap-1 border-border border-t pt-4">
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
                    size="sm"
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
                  onClick={onClose}
                  style={getBlurStyle(
                    externalLinksStartIndex + (githubUrl ? 1 : 0)
                  )}
                >
                  <Button
                    className="w-full justify-start gap-2 text-muted-foreground"
                    size="sm"
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

export function SiteHeader({
  links = [],
  githubUrl,
  discordUrl,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  // Only use resolved theme after mount to avoid hydration mismatch
  const logoTheme = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 h-14 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-full items-center justify-between gap-6 px-6">
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
                  <Button size="sm" variant="ghost">
                    {link.text}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            {githubUrl && (
              <Link
                aria-label="GitHub"
                className="hidden md:block"
                external
                href={githubUrl}
              >
                <Button
                  className="gap-2 font-light font-mono text-muted-foreground text-xs"
                  size="sm"
                  variant="ghost"
                >
                  <GitHubIcon />
                  <GithubStarCount />
                </Button>
              </Link>
            )}
            {discordUrl && (
              <Link
                aria-label="Discord"
                className="hidden md:block"
                external
                href={discordUrl}
              >
                <Button size="sm" variant="ghost">
                  <DiscordIcon className="size-4" />
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
              size="sm"
              variant="ghost"
            >
              <MenuIcon open={mobileMenuOpen} />
            </Button>
          </div>
        </div>
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
