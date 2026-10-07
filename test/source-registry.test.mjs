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

test("source records validate URLs, authority, standing and declared capabilities", () => {
  assert.throws(() => createSourceRecord({
    id: "source:bad-url", name: "Bad URL", publisher: "Example",
    canonicalUrl: "file:///private",
  }), /canonicalUrl must be an absolute HTTP\(S\) URL/);
  assert.throws(() => createSourceRecord({
    id: "source:bad-authority", name: "Bad authority", publisher: "Example",
    canonicalUrl: "https://example.invalid", authority: "trusted",
  }), /source authority is not recognized/);
  assert.throws(() => createSourceRecord({
    id: "source:bad-standing", name: "Bad standing", publisher: "Example",
    canonicalUrl: "https://example.invalid", standing: "trusted",
  }), /source standing must be candidate, accepted or rejected/);

  const source = createSourceRecord({
    id: "source:reviewed", name: "Reviewed source", publisher: "Example",
    canonicalUrl: "https://example.invalid", endpoint: "https://api.example.invalid",
    authority: "official", standing: "accepted", format: "geojson",
    capabilities: ["public-register"], reviewAt: "2027-01-01T00:00:00Z",
  });
  assert.equal(source.format, "geojson");
  assert.equal(source.reviewAt, "2027-01-01T00:00:00Z");
  assert.ok(Object.isFrozen(source.capabilities));
});

test("unknown authority levels cannot satisfy support checks", () => {
  assert.equal(sourceSupports({
    standing: "accepted", authority: "unknown",
  }, "unverified"), false);
  assert.equal(sourceSupports({
    standing: "accepted", authority: "official",
  }, "trusted"), false);
});
