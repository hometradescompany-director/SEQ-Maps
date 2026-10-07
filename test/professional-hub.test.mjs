import assert from "node:assert/strict";
import test from "node:test";
import { createProfessionalEntity } from "../src/core/professional-hub.mjs";

const base = {
  id: "professional:fixture:1",
  identity: { name: "Example Surveyor", externalId: "register:123" },
  profession: "surveyor",
  jurisdiction: "Queensland",
  registrationRefs: ["registration:123"],
  qualificationRefs: ["qualification:abc"],
  capabilities: ["boundary-survey"],
  serviceArea: ["locality:example"],
  contactChannels: [{ type: "website", value: "https://example.invalid/contact" }],
  sourceEvidence: [{
    sourceRef: "source:qld:register",
    evidenceRef: "evidence:register:123",
    observedAt: "2026-10-01T00:00:00Z",
  }],
  regulatorRef: "regulator:qld:surveyors",
  licence: "declared",
  termsUrl: "https://example.invalid/terms",
  observedAt: "2026-10-01T00:00:00Z",
  reviewAt: "2027-01-01T00:00:00Z",
  availability: null,
  relationships: ["service:planning"],
};

test("professional entities preserve provenance and freeze contract collections", () => {
  const entity = createProfessionalEntity(base);
  assert.equal(entity.identity.name, "Example Surveyor");
  assert.equal(entity.sourceEvidence[0].sourceRef, "source:qld:register");
  assert.equal(entity.availability, null);
  assert.ok(Object.isFrozen(entity));
  assert.ok(Object.isFrozen(entity.identity));
  assert.ok(Object.isFrozen(entity.sourceEvidence[0]));
  assert.ok(Object.isFrozen(entity.contactChannels[0]));
});

test("professional entities require a sourced identity and jurisdiction", () => {
  assert.throws(
    () => createProfessionalEntity({ ...base, sourceEvidence: [] }),
    /sourceEvidence must contain at least one source reference/,
  );
  assert.throws(
    () => createProfessionalEntity({ ...base, jurisdiction: "" }),
    /jurisdiction must be a non-empty string/,
  );
  assert.throws(
    () => createProfessionalEntity({
      ...base,
      sourceEvidence: [{ sourceRef: "source:fixture" }],
    }),
    /sourceEvidence\[0\]\.evidenceRef must be a non-empty string/,
  );
});
