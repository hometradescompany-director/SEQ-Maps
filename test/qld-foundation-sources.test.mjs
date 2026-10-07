import assert from "node:assert/strict";
import test from "node:test";
import { QLD_FOUNDATION_SOURCES, QLD_MAPS_ONLINE } from "../src/sources/qld-foundation.mjs";
import { sourceSupports, sourceCanBeQueried } from "../src/core/source-registry.mjs";

test("foundation sources preserve authority, licence and freshness metadata", () => {
  assert.equal(QLD_FOUNDATION_SOURCES.length, 4);
  for (const source of QLD_FOUNDATION_SOURCES) {
    assert.equal(source.standing, "accepted");
    assert.equal(source.licenceStanding, "declared");
    assert.ok(source.sourceUpdatedAt);
    assert.equal(sourceSupports(source, "official"), true);
  }
});

test("queryability requires an explicit endpoint rather than inferring one", () => {
  assert.equal(sourceCanBeQueried(QLD_MAPS_ONLINE), true);
  const boundary = QLD_FOUNDATION_SOURCES.find(source => source.id === "source:qld:lga-boundaries");
  assert.equal(sourceCanBeQueried(boundary), false);
});
