"use client";

import Link from "fumadocs-core/link";
import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { GithubStarCount } from "../github-star-count";
import { BklitLogo } from "../icons/bklit";
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
}

const components = [
  { text: "Line Chart", url: "/docs/components/line-chart" },
  { text: "Area Chart", url: "/docs/components/area-chart" },
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

export function SiteHeader({ links = [], githubUrl }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 h-14 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-full items-center justify-between gap-6 px-6">
          <div className="flex items-center gap-2">
            <Link
              className="font-semibold text-foreground text-lg no-underline transition-opacity hover:opacity-80"
              href="/"
            >
              <BklitLogo size={24} />
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

      {/* Mobile menu sheet */}
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sheet */}
      <div
        className={`fixed top-14 right-0 left-0 z-40 border-border border-b bg-background/95 backdrop-blur-xl transition-all duration-300 ease-out md:hidden ${
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-6 py-4">
          {/* Main links */}
          <div className="flex flex-col gap-1">
            {links.map((link, index) => (
              <Link
                className="transition-[filter] duration-300 ease-out"
                href={link.url}
                key={link.url}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  filter: mobileMenuOpen ? "blur(0px)" : "blur(2px)",
                  transitionDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms",
                }}
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
              style={{
                filter: mobileMenuOpen ? "blur(0px)" : "blur(2px)",
                transitionDelay: mobileMenuOpen
                  ? `${links.length * 50}ms`
                  : "0ms",
              }}
            >
              Components
            </span>
            <div className="flex flex-col gap-1">
              {components.map((component, index) => (
                <Link
                  className="transition-[filter] duration-300 ease-out"
                  href={component.url}
                  key={component.url}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    filter: mobileMenuOpen ? "blur(0px)" : "blur(2px)",
                    transitionDelay: mobileMenuOpen
                      ? `${(links.length + 1 + index) * 50}ms`
                      : "0ms",
                  }}
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

          {/* GitHub link */}
          {githubUrl && (
            <div
              className="mt-4 border-border border-t pt-4 transition-[filter] duration-300 ease-out"
              style={{
                filter: mobileMenuOpen ? "blur(0px)" : "blur(2px)",
                transitionDelay: mobileMenuOpen
                  ? `${(links.length + 1 + components.length) * 50}ms`
                  : "0ms",
              }}
            >
              <Link
                aria-label="GitHub"
                external
                href={githubUrl}
                onClick={() => setMobileMenuOpen(false)}
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
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
