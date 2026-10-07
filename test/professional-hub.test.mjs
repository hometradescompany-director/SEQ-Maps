import assert from "node:assert/strict";
import test from "node:test";
import { createProfessionalHub, hubIsDiscoverable } from "../src/core/professional-hub.mjs";

test("professional hubs are role projections with attributable sources", () => {
  const hub = createProfessionalHub({
    id: "hub:profession:surveyor:qld",
    role: "surveyor",
    profession: "surveying",
    jurisdiction: "Queensland, Australia",
    capabilities: ["boundary.interpretation"],
    regulatorRefs: ["regulator:qld:surveyors-board"],
    sourceRefs: ["source:qld:cadastre"],
    standing: "accepted",
  });
  assert.equal(hub.role, "surveyor");
  assert.equal(hubIsDiscoverable(hub), true);
});

test("an unsourced role cannot silently become discoverable", () => {
  const hub = createProfessionalHub({
    id: "hub:profession:unknown:qld", role: "unknown", profession: "unknown",
    jurisdiction: "Queensland, Australia", standing: "accepted",
  });
  assert.equal(hubIsDiscoverable(hub), false);
});
