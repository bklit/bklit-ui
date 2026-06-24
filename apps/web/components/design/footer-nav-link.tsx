import Link from "fumadocs-core/link";

interface FooterNavLinkProps {
  text: string;
  href: string;
  external?: boolean;
}

export function FooterNavLink({ text, href, external }: FooterNavLinkProps) {
  return (
    <Link
      className="group inline-flex items-center font-mono text-muted-foreground text-xs uppercase tracking-widest no-underline transition-colors hover:text-foreground"
      external={external}
      href={href}
    >
      {text}
      <span
        aria-hidden
        className="hidden animate-caret-blink group-hover:inline motion-reduce:animate-none"
      >
        _
      </span>
    </Link>
  );
}
