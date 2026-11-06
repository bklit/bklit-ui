import { SITE_URL } from "../site-url";

/**
 * OpenAPI 3.1 description of bklit.com's public machine-readable endpoints,
 * served at `/openapi.json`. Internal surfaces (the `/api/op` analytics proxy,
 * `/og/*` screenshot targets, dev labs) are intentionally left out.
 */

const problemResponse = (description: string) => ({
  description,
  content: {
    "application/problem+json": {
      schema: { $ref: "#/components/schemas/Problem" },
    },
  },
});

const pngResponse = {
  description: "PNG image.",
  content: {
    "image/png": { schema: { type: "string", contentMediaType: "image/png" } },
  },
};

const formatParameter = {
  name: "format",
  in: "query",
  required: false,
  description: "`wide` is 1200×630 (default); `square` is 1200×1200.",
  schema: { type: "string", enum: ["wide", "square"], default: "wide" },
};

export function buildOpenApiSpec({
  chartSlugs,
}: {
  chartSlugs: readonly string[];
}) {
  return {
    openapi: "3.1.0",
    info: {
      title: "Bklit UI public API",
      version: "1.0.0",
      summary:
        "Docs search, shadcn registry, and Open Graph image endpoints for Bklit UI.",
      description: `Read-only endpoints served by ${SITE_URL}. No authentication. Errors are RFC 9457 Problem Details. For an index of every docs page see ${SITE_URL}/llms.txt; pages and 404s are also available as Markdown with \`Accept: text/markdown\`.`,
      license: { name: "MIT", identifier: "MIT" },
      contact: { name: "Bklit UI", url: "https://github.com/bklit/bklit-ui" },
    },
    externalDocs: { description: "Documentation", url: `${SITE_URL}/docs` },
    servers: [{ url: SITE_URL }],
    tags: [
      { name: "docs", description: "Documentation search and indexes." },
      {
        name: "registry",
        description: "shadcn registry (`npx shadcn@latest add @bklit/<name>`).",
      },
      { name: "og", description: "Open Graph images." },
    ],
    paths: {
      "/api/search": {
        get: {
          operationId: "searchDocs",
          tags: ["docs"],
          summary: "Full-text search over the documentation",
          parameters: [
            {
              name: "query",
              in: "query",
              required: false,
              description:
                "Search terms. An empty or missing query returns [].",
              schema: { type: "string" },
              example: "area chart gradient",
            },
            {
              name: "tag",
              in: "query",
              required: false,
              description: "Comma-separated tags to filter by.",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Matching pages, headings, and text blocks.",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/SearchResult" },
                  },
                },
              },
            },
          },
        },
      },
      "/llms.txt": {
        get: {
          operationId: "getLlmsTxt",
          tags: ["docs"],
          summary: "llms.txt index of every docs page (https://llmstxt.org)",
          responses: {
            "200": {
              description: "Markdown index.",
              content: { "text/plain": { schema: { type: "string" } } },
            },
          },
        },
      },
      "/docs-tree.json": {
        get: {
          operationId: "getDocsTree",
          tags: ["docs"],
          summary: "Docs sidebar page tree",
          responses: {
            "200": {
              description: "Fumadocs page tree (`name`, `children` nodes).",
              content: {
                "application/json": {
                  schema: { type: "object", additionalProperties: true },
                },
              },
            },
          },
        },
      },
      "/changelog/rss.xml": {
        get: {
          operationId: "getChangelogFeed",
          tags: ["docs"],
          summary: "Changelog RSS 2.0 feed",
          responses: {
            "200": {
              description: "RSS feed, newest entry first.",
              content: {
                "application/rss+xml": { schema: { type: "string" } },
              },
            },
          },
        },
      },
      "/r/registry.json": {
        get: {
          operationId: "getRegistry",
          tags: ["registry"],
          summary: "shadcn registry index of every component",
          externalDocs: { url: "https://ui.shadcn.com/schema/registry.json" },
          responses: {
            "200": {
              description: "Registry (`name`, `homepage`, `items`).",
              content: {
                "application/json": {
                  schema: { type: "object", additionalProperties: true },
                },
              },
            },
          },
        },
      },
      "/r/{name}.json": {
        get: {
          operationId: "getRegistryItem",
          tags: ["registry"],
          summary: "One shadcn registry item, including file sources",
          externalDocs: {
            url: "https://ui.shadcn.com/schema/registry-item.json",
          },
          parameters: [
            {
              name: "name",
              in: "path",
              required: true,
              description: "Item name from /r/registry.json.",
              schema: { type: "string" },
              example: "area-chart",
            },
          ],
          responses: {
            "200": {
              description: "Registry item.",
              content: {
                "application/json": {
                  schema: { type: "object", additionalProperties: true },
                },
              },
            },
            "404": { description: "No registry item with that name." },
          },
        },
      },
      "/api/og/home": {
        get: {
          operationId: "getHomeOgImage",
          tags: ["og"],
          summary: "Homepage Open Graph image",
          parameters: [formatParameter],
          responses: {
            "200": pngResponse,
            "400": problemResponse("Unknown `format`."),
            "503": problemResponse("Rendering failed; retry."),
          },
        },
      },
      "/api/og/charts/{chart}": {
        get: {
          operationId: "getChartOgImage",
          tags: ["og"],
          summary: "Open Graph image for a chart page",
          parameters: [
            {
              name: "chart",
              in: "path",
              required: true,
              schema: { type: "string", enum: [...chartSlugs] },
            },
            formatParameter,
          ],
          responses: {
            "200": pngResponse,
            "400": problemResponse("Unknown `format`."),
            "404": problemResponse("Unknown chart."),
            "503": problemResponse("Rendering failed; retry."),
          },
        },
      },
      "/api/og/studio": {
        get: {
          operationId: "getStudioOgImage",
          tags: ["og"],
          summary: "Open Graph card for a Studio state",
          parameters: [
            {
              name: "s",
              in: "query",
              required: false,
              description:
                "Serialized Studio state (the `s` param of a /studio URL).",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": pngResponse,
            "503": problemResponse("Screenshot failed; retry."),
          },
        },
      },
    },
    components: {
      schemas: {
        SearchResult: {
          type: "object",
          required: ["id", "url", "type", "content"],
          properties: {
            id: { type: "string" },
            url: {
              type: "string",
              description: "Site-relative URL, may include a #heading anchor.",
            },
            type: { type: "string", enum: ["page", "heading", "text"] },
            content: { type: "string" },
            breadcrumbs: { type: "array", items: { type: "string" } },
          },
        },
        Problem: {
          type: "object",
          description:
            "RFC 9457 Problem Details with `code` and `hint` extensions.",
          required: ["type", "title", "status", "detail", "code", "hint"],
          properties: {
            type: { type: "string", format: "uri" },
            title: { type: "string" },
            status: { type: "integer" },
            detail: { type: "string" },
            code: {
              type: "string",
              description: "Stable machine-readable error code.",
              examples: ["not_found", "unknown_chart", "unknown_format"],
            },
            hint: { type: "string", description: "How to resolve the error." },
            instance: { type: "string" },
          },
        },
      },
    },
  } as const;
}
