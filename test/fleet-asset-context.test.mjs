import test from "node:test";
import assert from "node:assert/strict";
import { createAssetContext, projectFleetAssetSummary } from "../src/core/fleet-asset-context.mjs";
const observation = { id: "obs1", kind: "asset.observed", sourceRef: "council-fixture", subjectRef: "asset-1", validAt: "2026-10-09T01:00:00Z", knownAt: "2026-10-09T02:00:00Z", ingestedAt: "2026-10-09T03:00:00Z", license: { standing: "declared", id: "synthetic-test-data" }, evidenceRef: "e1" };
test("fleet context retains property and temporal provenance without granting access", () => {
  const c = createAssetContext({ assetRef: "asset-1", segmentRef: "seg-1", assetClass: "drainage", propertyRef: "property-opaque", observation });
  assert.equal(c.propertyRef, "property-opaque");
  assert.equal(c.accessStanding, "not-established");
  assert.equal(c.observation.validAt, observation.validAt);
  assert.equal(c.observation.knownAt, observation.knownAt);
  assert.equal(c.observation.ingestedAt, observation.ingestedAt);
});
test("fleet summary preserves null when no observations exist", () => {
  const empty = projectFleetAssetSummary([], "seg-1");
  assert.equal(empty.lastKnownAt, null);
  assert.equal(empty.assetCount, 0);
});
test("licence and asset-class failures refuse unsupported records", () => {
  assert.throws(() => createAssetContext({ assetRef: "asset", segmentRef: "segment", assetClass: "drainage", observation: { ...observation, license: { standing: "unknown" } } }), /licence_not_declared/);
  assert.throws(() => createAssetContext({ assetRef: "asset", segmentRef: "segment", assetClass: "magic", observation }), /unsupported_asset_class/);
});
