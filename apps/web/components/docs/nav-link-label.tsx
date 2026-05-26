import { isNewNavLink } from "@/lib/is-new-nav-link";

export function NavLinkLabel({ text, url }: { text: string; url: string }) {
  if (!isNewNavLink(url)) {
    return text;
  }

  return (
    <span className="flex items-center gap-1.5">
      {text}
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-chart-1" />
    </span>
  );
}
