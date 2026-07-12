import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the complete Litter housing dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Pokohomes/);
  assert.match(html, /Make every/);
  assert.match(html, /Garden Pavilion/);
  assert.match(html, /Crystal Observatory/);
  assert.match(html, /Jirachi/);
  assert.match(html, /35/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
});

test("keeps Dry Trapinch out of the Humid Mudroom group", async () => {
  const data = JSON.parse(await readFile(new URL("../app/litter-data.json", import.meta.url), "utf8"));
  const mudroom = data.houses.find((house) => house.id === "mudroom");
  const ruggedLookout = data.houses.find((house) => house.id === "rugged-lookout");

  assert.deepEqual(mudroom.pokemon.map((pokemon) => pokemon.slug), ["paldeanwooper", "clodsire"]);
  assert.deepEqual(ruggedLookout.pokemon.map((pokemon) => pokemon.slug), ["cacturne", "trapinch"]);
  assert.equal(new Set(data.houses.flatMap((house) => house.pokemon.map((pokemon) => pokemon.slug))).size, 35);
});
