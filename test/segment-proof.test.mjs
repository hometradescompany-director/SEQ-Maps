import test from "node:test";
import assert from "node:assert/strict";
const proofModule = await import("../scripts/segment-context-proof.mjs");

test("runnable proof labels the entire adapter-to-context result synthetic", () => {
  assert.equal(typeof proofModule.buildSyntheticSegmentProof, "function");
  const proof = proofModule.buildSyntheticSegmentProof();
  assert.equal(proof.evidenceStanding, "synthetic");
  assert.equal(proof.context.segmentRef, "segment:synthetic:example-road");
  assert.equal(proof.context.claims[0].payload.eventType, "Congestion");
  assert.equal(proof.context.claims[0].bindingStanding, "asserted");
  assert.equal(proof.context.claims[0].sourceRef, "qldtraffic:events:v2");
});
