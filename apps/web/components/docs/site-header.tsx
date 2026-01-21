"use client";

import Link from "fumadocs-core/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { GithubStarCount } from "../github-star-count";
import { GitHubIcon } from "../icons/github";
import { Button } from "../ui/button";

interface NavLink {
  text: string;
  url: string;
  active?: "url" | "nested-url";
}

interface SiteHeaderProps {
  title: React.ReactNode;
  links?: NavLink[];
  githubUrl?: string;
}

export function SiteHeader({ title, links = [], githubUrl }: SiteHeaderProps) {
  const pathname = usePathname();

  const isActive = (link: NavLink) => {
    if (link.active === "nested-url") {
      return pathname.startsWith(link.url);
    }
    return pathname === link.url;
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50 h-14 border-border border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-6 px-6">
        {/* Logo / Title */}
        <Link
          className="font-semibold text-foreground text-lg no-underline transition-opacity hover:opacity-80"
          href="/"
        >
          {title}
        </Link>

        {/* Navigation Links */}
        <nav className="ml-auto flex items-center gap-1">
          {links.map((link) => (
            <Link
              className={`rounded-lg px-3 py-2 font-medium text-sm no-underline transition-colors ${
                isActive(link)
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
              href={link.url}
              key={link.url}
            >
              {link.text}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {githubUrl && (
            <Link aria-label="GitHub" external href={githubUrl}>
              <Button size="sm" variant="ghost">
                <GitHubIcon />
                <GithubStarCount />
              </Button>
            </Link>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
