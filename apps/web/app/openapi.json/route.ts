import { validChartSlugs } from "@/components/charts/chart-slugs";
import { buildOpenApiSpec } from "@/lib/agent/openapi";

/** `/openapi.json` — OpenAPI 3.1 description of the public endpoints. */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildOpenApiSpec({ chartSlugs: validChartSlugs }), {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
