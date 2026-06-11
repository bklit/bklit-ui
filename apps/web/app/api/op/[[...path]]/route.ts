import { createRouteHandler } from "@openpanel/nextjs/server";

import { SITE_URL } from "@/lib/site-url";

const { GET: baseGET, POST: basePOST } = createRouteHandler();

const canonicalOrigin = new URL(SITE_URL).origin;

/** Legacy/alternate hosts that should proxy with the canonical origin. */
const productionOrigins = new Set([
  canonicalOrigin,
  "https://ui.bklit.com",
  "https://www.bklit.com",
]);

function shouldNormalizeOrigin(request: Request) {
  const { pathname } = new URL(request.url);
  if (!pathname.includes("/track") || request.method !== "POST") {
    return false;
  }

  const origin =
    request.headers.get("origin") ??
    `${new URL(request.url).protocol}//${new URL(request.url).host}`;

  return productionOrigins.has(origin) || origin.endsWith(".vercel.app");
}

function withCanonicalOrigin(request: Request) {
  if (!shouldNormalizeOrigin(request)) {
    return request;
  }

  const headers = new Headers(request.headers);
  headers.set("origin", canonicalOrigin);

  return new Request(request.url, {
    method: request.method,
    headers,
    body: request.body,
    duplex: "half",
  } as RequestInit);
}

export function GET(request: Request) {
  return baseGET(request);
}

export function POST(request: Request) {
  return basePOST(withCanonicalOrigin(request));
}
