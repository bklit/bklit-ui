import { type NextRequest, NextResponse } from "next/server";
import {
  isUnknownTopLevelPath,
  prefersMarkdown,
} from "@/lib/agent/markdown-negotiation";
import {
  homeMarkdown,
  markdownResponse,
  notFoundMarkdown,
} from "@/lib/agent/site-markdown";
import { SITE_URL } from "@/lib/site-url";

const canonicalUrl = new URL(SITE_URL);
const CANONICAL_HOST = canonicalUrl.host;

export function middleware(request: NextRequest) {
  const requestHost = (
    request.headers.get("host") ?? request.nextUrl.host
  ).toLowerCase();
  const canonicalHost = CANONICAL_HOST.toLowerCase();

  if (
    process.env.VERCEL_ENV === "production" &&
    requestHost !== canonicalHost &&
    requestHost.endsWith(".vercel.app")
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = canonicalUrl.protocol;
    redirectUrl.host = CANONICAL_HOST;
    redirectUrl.port = "";

    return NextResponse.redirect(redirectUrl, 308);
  }

  const { pathname } = request.nextUrl;
  const canonicalPageUrl = new URL(pathname, SITE_URL);

  // Markdown content negotiation (https://acceptmarkdown.com): agents that
  // ask for `text/markdown` get the homepage, and 404s for paths no route can
  // match, as Markdown. Everyone else keeps getting HTML.
  if (prefersMarkdown(request.headers.get("accept"))) {
    if (pathname === "/") {
      const response = markdownResponse(homeMarkdown());
      response.headers.set(
        "Link",
        `<${canonicalPageUrl.href}>; rel="canonical"`
      );
      return response;
    }
    if (isUnknownTopLevelPath(pathname)) {
      return markdownResponse(notFoundMarkdown(pathname), 404);
    }
  }

  const response = NextResponse.next();
  // These responses vary by Accept (HTML vs Markdown); say so to caches.
  if (pathname === "/" || isUnknownTopLevelPath(pathname)) {
    response.headers.set("Vary", "Accept");
  }
  response.headers.set("Link", `<${canonicalPageUrl.href}>; rel="canonical"`);

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/robots.txt",
    "/sitemap.xml",
  ],
};
