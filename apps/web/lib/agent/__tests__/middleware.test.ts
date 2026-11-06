import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { middleware } from "../../../middleware";

function request(path: string, accept?: string) {
  return new NextRequest(`https://bklit.com${path}`, {
    headers: accept ? { accept } : {},
  });
}

test("homepage: Accept text/markdown returns Markdown with Vary: Accept", async () => {
  const response = middleware(request("/", "text/markdown"));
  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get("content-type"),
    "text/markdown; charset=utf-8"
  );
  assert.equal(response.headers.get("vary"), "Accept");
  assert.ok(response.headers.get("link")?.includes('rel="canonical"'));
  assert.ok((await response.text()).startsWith("# Bklit UI"));
});

test("homepage: Accept text/html passes through to the page with Vary: Accept", () => {
  const response = middleware(request("/", "text/html"));
  assert.equal(response.headers.get("x-middleware-next"), "1");
  assert.equal(response.headers.get("vary"), "Accept");
});

test("unknown path: Accept text/markdown returns a Markdown 404", async () => {
  const response = middleware(
    request("/__ora-404-probe-vkqk2fjn", "text/markdown")
  );
  assert.equal(response.status, 404);
  assert.equal(
    response.headers.get("content-type"),
    "text/markdown; charset=utf-8"
  );
  assert.ok((await response.text()).includes("/llms.txt"));
});

test("unknown path: HTML clients still get the HTML not-found page", () => {
  const response = middleware(
    request("/__ora-404-probe-vkqk2fjn", "text/html")
  );
  assert.equal(response.headers.get("x-middleware-next"), "1");
});

test("known pages are untouched by Markdown negotiation", () => {
  const response = middleware(request("/docs/installation", "text/markdown"));
  assert.equal(response.headers.get("x-middleware-next"), "1");
  assert.equal(response.headers.get("vary"), null);
});
