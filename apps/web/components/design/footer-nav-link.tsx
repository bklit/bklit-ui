import Link from "fumadocs-core/link";

interface FooterNavLinkProps {
  text: string;
  href: string;
  external?: boolean;
}

export function FooterNavLink({ text, href, external }: FooterNavLinkProps) {
  return (
    <Link
      className="inline-flex items-center text-muted-foreground text-sm no-underline transition-colors hover:text-foreground"
      external={external}
      href={href}
    >
      {text}
    </Link>
  );
}
