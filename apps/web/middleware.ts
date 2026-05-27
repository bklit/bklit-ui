import { type NextRequest, NextResponse } from "next/server";
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

  const response = NextResponse.next();
  const canonicalPageUrl = new URL(request.nextUrl.pathname, SITE_URL);
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
