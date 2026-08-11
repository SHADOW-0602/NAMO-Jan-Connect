import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the NAMO Jan Connect product", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /NAMO Jan Connect/i);
  assert.match(html, /Every concern/);
  assert.match(html, /File a complaint/);
  assert.match(html, /Public transparency/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("includes durable complaint capabilities and social metadata", async () => {
  const [api, schema, hosting, layout] = await Promise.all([
    readFile(new URL("app/api/complaints/route.ts", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL(".openai/hosting.json", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);
  assert.match(api, /allowedTransitions/);
  assert.match(api, /department_staff/);
  assert.match(api, /email_logs/);
  assert.match(schema, /statusHistory/);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(hosting, /"r2": "UPLOADS"/);
  assert.match(layout, /og\.png/);
});
