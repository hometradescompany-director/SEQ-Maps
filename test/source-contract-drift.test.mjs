import assert from "node:assert/strict";
import test from "node:test";
import { detectSourceContractDrift } from "../src/core/source-contract-drift.mjs";

test("detects the 2026 Queensland administrative-boundary CRS migration as breaking drift", () => {
  const result = detectSourceContractDrift(
    { sourceId:"qld:administrative-boundaries", crs:"EPSG:4283", protocol:"arcgis-rest", queryFormats:["JSON","geoJSON","PBF"] },
    { sourceId:"qld:administrative-boundaries", crs:3857, protocol:"arcgis-rest", queryFormats:["JSON","geoJSON","PBF"] },
  );
  assert.equal(result.changed, true);
  assert.equal(result.requiresReview, true);
  assert.deepEqual(result.changes[0], {field:"crs", before:"EPSG:4283", after:"EPSG:3857", severity:"breaking"});
});

test("normalizes ArcGIS Web Mercator aliases", () => {
  const result = detectSourceContractDrift({crs:102100}, {crs:"EPSG:3857"});
  assert.equal(result.changed, false);
  assert.equal(result.requiresReview, false);
});

test("flags removed query formats but treats additive formats as compatible", () => {
  const removed = detectSourceContractDrift({queryFormats:["JSON","geoJSON","PBF"]}, {queryFormats:["JSON","geoJSON"]});
  assert.equal(removed.requiresReview, true);
  assert.equal(removed.changes[0].severity, "breaking");
  assert.deepEqual(removed.changes[0].removed, ["PBF"]);

  const added = detectSourceContractDrift({queryFormats:["JSON"]}, {queryFormats:["JSON","geoJSON"]});
  assert.equal(added.requiresReview, false);
  assert.equal(added.changes[0].severity, "compatible");
});

test("licence drift requires review without pretending permission changed automatically", () => {
  const result = detectSourceContractDrift({licence:"CC BY 4.0"}, {licence:"custom"});
  assert.equal(result.requiresReview, true);
  assert.equal(result.changes[0].severity, "review");
});
