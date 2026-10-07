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

test("source records preserve format and freshness metadata immutably", () => {
  const capabilities = ["roads"];
  const source = createSourceRecord({
    id: "source:qld:roads", name: "Roads", publisher: "Queensland Government",
    canonicalUrl: "https://example.invalid/roads", authority: "official",
    format: "geojson", declaredCapabilities: capabilities, standing: "accepted",
    observedAt: "2026-09-24T09:00:00.000Z", reviewAt: "2027-09-24T09:00:00.000Z",
  });

  capabilities.push("private-data");
  assert.deepEqual(source.capabilities, ["roads"]);
  assert.equal(source.format, "geojson");
  assert.equal(source.reviewAt, "2027-09-24T09:00:00.000Z");
  assert.equal(sourceSupports(source, "unverified"), true);
  assert.equal(sourceSupports(source, "canonical"), false);
});

test("source records reject malformed authority, capability, and freshness metadata", () => {
  const source = {
    id: "source:test", name: "Test", publisher: "Publisher",
    canonicalUrl: "https://example.invalid",
  };
  assert.throws(() => createSourceRecord({ ...source, authority: "trusted" }), /authority/);
  assert.throws(() => createSourceRecord({ ...source, capabilities: "roads" }), /array/);
  assert.throws(() => createSourceRecord({ ...source, expiresAt: "later" }), /ISO-compatible/);
  assert.equal(sourceSupports({ standing: "accepted", authority: "bogus" }), false);
});
