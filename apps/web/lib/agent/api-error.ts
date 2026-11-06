import { SITE_URL } from "../site-url";

/**
 * Machine-readable API errors as RFC 9457 Problem Details
 * (`application/problem+json`) plus `code` and `hint` extension members.
 */
export const PROBLEM_CONTENT_TYPE = "application/problem+json";

export interface ApiProblem {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  hint: string;
  instance?: string;
}

const TITLES: Record<number, string> = {
  400: "Bad Request",
  404: "Not Found",
  405: "Method Not Allowed",
  500: "Internal Server Error",
  503: "Service Unavailable",
};

export function apiProblem(options: {
  status: number;
  code: string;
  detail: string;
  hint?: string;
  instance?: string;
}): ApiProblem {
  return {
    type: `${SITE_URL}/openapi.json#/components/schemas/Problem`,
    title: TITLES[options.status] ?? "Error",
    status: options.status,
    detail: options.detail,
    code: options.code,
    hint:
      options.hint ??
      `See ${SITE_URL}/openapi.json for the available endpoints.`,
    ...(options.instance ? { instance: options.instance } : {}),
  };
}

export function apiErrorResponse(
  options: Parameters<typeof apiProblem>[0],
  init?: { headers?: Record<string, string> }
): Response {
  return new Response(JSON.stringify(apiProblem(options)), {
    status: options.status,
    headers: {
      "Content-Type": PROBLEM_CONTENT_TYPE,
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  });
}
