import { apiErrorResponse } from "@/lib/agent/api-error";

/**
 * Catch-all for `/api/*` paths no route handles: a JSON Problem Details 404
 * instead of the HTML not-found page, so API clients and agents can parse it.
 * Real routes (`/api/search`, `/api/og/*`, `/api/op/*`) are more specific
 * and always win.
 */
function notFound(request: Request) {
  const { pathname } = new URL(request.url);
  return apiErrorResponse({
    status: 404,
    code: "not_found",
    detail: `No API endpoint at ${pathname}.`,
    instance: pathname,
  });
}

export const GET = notFound;
export const HEAD = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
export const OPTIONS = notFound;
