"use client";

import type * as PageTree from "fumadocs-core/page-tree";
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
import { NavBadge } from "@/components/nav-badge";
import { getAnalyticsUrl, trackEvent } from "@/lib/analytics/track-client";
import { getNavBadge } from "@/lib/nav-badges";
import {
  isFileUrl,
  type SiteNavLink,
  siteNavLinks,
} from "@/lib/site-nav-links";
import { loadDocsTree, useDocsTree } from "@/lib/use-docs-tree";
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

function trackDiscordClick(location: "header" | "mobile_menu") {
  trackEvent("discord_click", {
    location,
    url: getAnalyticsUrl(),
  });
}

interface SiteHeaderProps {
  links?: SiteNavLink[];
  githubUrl?: string;
  discordUrl?: string;
}

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
  const classes = cn(
    "flex items-center gap-2 rounded-sm py-1.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
    active && "text-foreground",
    className
  );

  // Plain-file routes such as /llms.txt bypass the client router (same as
  // the docs sidebar, which opens them in a new tab).
  if (typeof href === "string" && isFileUrl(href)) {
    return (
      <a
        className={classes}
        href={href}
        onClick={props.onClick}
        rel="noreferrer noopener"
        target="_blank"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={classes}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}

/** Split the docs page tree into sections at each `---Separator---`. */
function groupDocsTree(nodes: PageTree.Node[]) {
  const sections: { title: string; nodes: PageTree.Node[] }[] = [];
  for (const node of nodes) {
    if (node.type === "separator") {
      sections.push({ title: String(node.name ?? ""), nodes: [] });
      continue;
    }
    if (sections.length === 0) {
      sections.push({ title: "Docs", nodes: [] });
    }
    sections.at(-1)?.nodes.push(node);
  }
  return sections.filter((section) => section.nodes.length > 0);
}

function MobileDocsNode({
  node,
  pathname,
  onClose,
}: {
  node: PageTree.Node;
  pathname: string | null;
  onClose: () => void;
}) {
  if (node.type === "page") {
    return (
      <MobileLink
        active={pathname === node.url}
        href={node.url}
        onClick={onClose}
      >
        {node.name}
        <NavBadge kind={getNavBadge(node.url)} />
      </MobileLink>
    );
  }

  if (node.type !== "folder") {
    return null;
  }

  const indexUrl = node.index?.url;
  const children = node.children.filter(
    (child) => !(child.type === "page" && child.url === indexUrl)
  );

  return (
    <div className="flex flex-col">
      {indexUrl ? (
        <MobileLink
          active={pathname === indexUrl}
          href={indexUrl}
          onClick={onClose}
        >
          {node.name}
          <NavBadge kind={getNavBadge(indexUrl)} />
        </MobileLink>
      ) : (
        <span className="py-1.5 text-muted-foreground/72">{node.name}</span>
      )}
      {children.length > 0 ? (
        <div className="ms-1 flex flex-col border-border/64 border-s ps-3">
          {children.map((child, index) => (
            <MobileDocsNode
              key={child.$id ?? index}
              node={child}
              onClose={onClose}
              pathname={pathname}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface MobileMenuProps {
  githubUrl?: string;
  discordUrl?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MobileMenu({
  githubUrl,
  discordUrl,
  open,
  onOpenChange,
}: MobileMenuProps) {
  const pathname = usePathname();
  const onClose = () => onOpenChange(false);
  // The docs section mirrors the docs sidebar. The tree is fetched on first
  // open (see `app/docs-tree.json/route.ts` for why it isn't a prop).
  const docsTree = useDocsTree(open);

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetTrigger
        render={
          <Button
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative -ms-1.5 size-8 lg:hidden"
            // Start the tree fetch as the finger lands, before the click.
            onPointerDown={() => {
              loadDocsTree();
            }}
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
              {siteNavLinks.map((link) => (
                <MobileLink
                  active={isNavLinkActive(pathname, link.url)}
                  href={link.url}
                  key={link.url}
                  onClick={onClose}
                >
                  {link.text}
                  <NavBadge kind={getNavBadge(link.url)} />
                </MobileLink>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {groupDocsTree(docsTree?.children ?? []).map((section) => (
              <MobileMenuSection key={section.title} title={section.title}>
                {section.nodes.map((node, index) => (
                  <MobileDocsNode
                    key={node.$id ?? index}
                    node={node}
                    onClose={onClose}
                    pathname={pathname}
                  />
                ))}
              </MobileMenuSection>
            ))}

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
                  {link.text}
                  <NavBadge kind={getNavBadge(link.url)} />
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
