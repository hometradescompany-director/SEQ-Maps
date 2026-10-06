import assert from "node:assert/strict";
import test from "node:test";
import { createSourceRecord, sourceSupports } from "../src/core/source-registry.mjs";

test("source records preserve provenance and licence standing", () => {
  const source = createSourceRecord({
    id: "source:qld:test", name: "Test civic API", publisher: "Test authority",
    kind: "local_authority", authority: "authoritative",
    canonicalUrl: "https://example.invalid/api", protocol: "rest",
    licence: "declared", standing: "accepted",
  });
  assert.equal(source.publisher, "Test authority");
  assert.equal(source.licence, "declared");
  assert.equal(sourceSupports(source, "official"), true);
});

test("candidate sources cannot silently become trusted", () => {
  const source = createSourceRecord({
    id: "source:unknown", name: "Unknown", publisher: "Unknown",
    canonicalUrl: "https://example.invalid",
  });
  assert.equal(sourceSupports(source), false);
});
