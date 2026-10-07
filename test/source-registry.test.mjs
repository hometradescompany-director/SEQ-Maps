import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createSourceRecord, sourceSupports } from "../src/core/source-registry.mjs";

const acceptedSource = {
  id: "source:qld:test", name: "Test civic API", publisher: "Test authority",
  kind: "local_authority", authority: "authoritative", jurisdiction: "Queensland",
  canonicalUrl: "https://example.invalid/api", endpoint: "https://example.invalid/service",
  protocol: "rest", licence: "CC BY 4.0", termsUrl: "https://example.invalid/terms",
  standing: "accepted", observedAt: "2026-10-07T00:00:00.000Z",
  reviewAt: "2027-01-05T00:00:00.000Z",
};

test("source records preserve provenance and licence standing", () => {
  const source = createSourceRecord(acceptedSource);
  assert.equal(source.publisher, "Test authority");
  assert.equal(source.licence, "CC BY 4.0");
  assert.equal(sourceSupports(source, "official"), true);
  assert.equal(source.executionAuthority, null);
});

test("candidate sources cannot silently become trusted", () => {
  const source = createSourceRecord({
    id: "source:unknown", name: "Unknown", publisher: "Unknown",
    canonicalUrl: "https://example.invalid",
  });
  assert.equal(sourceSupports(source), false);
  assert.equal(sourceSupports(createSourceRecord(acceptedSource), "unrecognized"), false);
  assert.equal(sourceSupports({ ...acceptedSource, termsUrl: null }), false);
});

test("accepted sources require verified endpoint, terms and freshness metadata", () => {
  const { endpoint, ...incomplete } = acceptedSource;
  assert.throws(() => createSourceRecord(incomplete), /accepted source endpoint/);
});

test("Queensland seed sources retain attribution and review metadata", () => {
  const sources = JSON.parse(readFileSync(new URL("../data/sources/qld-seq-seed.json", import.meta.url)));
  assert.ok(sources.length >= 4);
  for (const source of sources) {
    const record = createSourceRecord({ ...source, capabilities: source.declaredCapabilities });
    assert.equal(record.standing, "accepted");
    assert.equal(record.authority, "authoritative");
    assert.ok(record.endpoint);
    assert.ok(record.termsUrl);
    assert.ok(record.attribution);
    assert.ok(record.observedAt);
    assert.ok(record.reviewAt);
    assert.equal(record.executionAuthority, null);
  }
});
