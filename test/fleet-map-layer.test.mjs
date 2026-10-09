import test from "node:test";
import assert from "node:assert/strict";
import { projectFleetMapLayer } from "../src/core/fleet-map-layer.mjs";
const observation = {
  id: "obs-1", kind: "asset.observed", sourceRef: "synthetic-council",
  subjectRef: "asset-1", validAt: "2026-10-09T01:00:00Z",
  knownAt: "2026-10-09T02:00:00Z", ingestedAt: "2026-10-09T03:00:00Z",
  license: { standing: "declared", id: "synthetic-fixture" }, evidenceRef: "receipt-1"
};
const asset = { assetRef: "asset-1", segmentRef: "road-1", assetClass: "drainage", propertyRef: "opaque-property", observation };
test("valid coordinates produce attributable GeoJSON point", () => {
  const output = projectFleetMapLayer([{ ...asset, coordinates: [153.18, -27.67] }]);
  assert.equal(output.type, "FeatureCollection");
  assert.equal(output.features.length, 1);
  assert.deepEqual(output.features[0].geometry.coordinates, [153.18, -27.67]);
  assert.equal(output.features[0].properties.sourceRef, "synthetic-council");
  assert.equal(output.features[0].properties.evidenceRef, "receipt-1");
  assert.equal(output.features[0].properties.accessStanding, "not-established");
});
test("unknown geometry is an explicit omission, not a fake map point", () => {
  const output = projectFleetMapLayer([{ ...asset, coordinates: null }]);
  assert.equal(output.features.length, 0);
  assert.deepEqual(output.metadata.omissions, [{ assetRef: "asset-1", reason: "geometry_unavailable" }]);
});
test("out-of-range coordinates are rejected as geometry, not guessed", () => {
  const output = projectFleetMapLayer([{ ...asset, coordinates: [300, -27.67] }]);
  assert.equal(output.metadata.omitted, 1);
});
test("unknown licence cannot be rendered as approved source", () => {
  assert.throws(() => projectFleetMapLayer([{ ...asset, coordinates: [153.18, -27.67], observation: { ...observation, license: { standing: "unknown" } } }]), /licence_not_declared/);
});
