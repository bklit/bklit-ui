import assert from "node:assert/strict";
import test from "node:test";
import { apiErrorResponse } from "../api-error";
import { buildOpenApiSpec } from "../openapi";
import {
  homeMarkdown,
  markdownResponse,
  notFoundMarkdown,
} from "../site-markdown";

test("homeMarkdown links to docs and agent indexes", () => {
  const body = homeMarkdown();
  assert.ok(body.startsWith("# Bklit UI"));
  assert.ok(body.includes("(https://bklit.com/docs)"));
  assert.ok(body.includes("(https://bklit.com/llms.txt)"));
  assert.ok(body.includes("(https://bklit.com/openapi.json)"));
});

test("notFoundMarkdown explains the error, links docs, escapes the path", () => {
  const body = notFoundMarkdown("/missing](javascript:x)");
  assert.ok(body.length >= 20);
  assert.ok(body.includes("404"));
  assert.ok(body.includes("(https://bklit.com/docs)"));
  assert.ok(body.includes("(https://bklit.com/sitemap.xml)"));
  assert.ok(!body.includes("](javascript"));
});

test("markdownResponse sets Markdown headers and status", async () => {
  const ok = markdownResponse("# Hi");
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("content-type"), "text/markdown; charset=utf-8");
  assert.equal(ok.headers.get("vary"), "Accept");
  assert.equal(ok.headers.get("x-robots-tag"), null);
  assert.equal(await ok.text(), "# Hi");

  const missing = markdownResponse("# Gone", 404);
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get("x-robots-tag"), "noindex");
});

test("apiErrorResponse returns RFC 9457 problem JSON", async () => {
  const response = apiErrorResponse({
    status: 404,
    code: "not_found",
    detail: "No API endpoint at /api/nope.",
    instance: "/api/nope",
  });
  assert.equal(response.status, 404);
  assert.equal(
    response.headers.get("content-type"),
    "application/problem+json"
  );
  const body = await response.json();
  assert.equal(body.status, 404);
  assert.equal(body.title, "Not Found");
  assert.equal(body.code, "not_found");
  assert.equal(body.instance, "/api/nope");
  assert.ok(body.hint.includes("/openapi.json"));
  assert.ok(body.type.startsWith("https://bklit.com/"));
});

test("buildOpenApiSpec is a valid-shaped OpenAPI 3.1 document", () => {
  const spec = buildOpenApiSpec({ chartSlugs: ["area-chart", "bar-chart"] });
  assert.equal(spec.openapi, "3.1.0");
  assert.equal(spec.servers[0].url, "https://bklit.com");
  assert.ok(spec.info.title && spec.info.version);
  const operationIds = new Set<string>();
  for (const [path, item] of Object.entries(spec.paths)) {
    assert.ok(path.startsWith("/"), path);
    for (const operation of Object.values(item)) {
      assert.ok(!operationIds.has(operation.operationId));
      operationIds.add(operation.operationId);
      assert.ok(operation.responses["200"], `${path} documents 200`);
    }
    // Every {template} has a matching required path parameter.
    for (const [, name] of path.matchAll(/\{([^}]+)\}/g)) {
      const params = (
        "parameters" in item.get ? item.get.parameters : []
      ) as readonly { name: string; in: string; required?: boolean }[];
      assert.ok(
        params.some((p) => p.name === name && p.in === "path" && p.required),
        `${path} declares path param ${name}`
      );
    }
  }
  // All $refs resolve.
  const refs = JSON.stringify(spec).match(/#\/components\/schemas\/\w+/g) ?? [];
  for (const ref of refs) {
    const name = ref.split("/").at(-1) ?? "";
    assert.ok(name in spec.components.schemas, ref);
  }
});
