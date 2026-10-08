import assert from "node:assert/strict";
import test from "node:test";
import { createProfessionalHub } from "../src/core/professional-hub.mjs";

const hubInput = {
  identity: { id: "hub:example:1", name: "Example service" },
  role: "electrician",
  profession: "Electrical services",
  jurisdiction: "Queensland",
  registrationReferences: ["register:example:1"],
  capabilities: ["residential"],
  serviceArea: { locality: "Brisbane" },
  contactChannels: [{ kind: "website", value: "https://example.invalid" }],
  sourceEvidence: ["evidence:register:1"],
  authority: "Queensland electrical safety regulator",
  terms: { standing: "declared", id: "public-register-terms", url: "https://example.invalid/terms" },
  freshness: { observedAt: "2026-10-07T00:00:00.000Z", reviewAt: "2027-01-05T00:00:00.000Z" },
  availability: null,
  relationships: [],
};

test("professional hubs preserve one shared, immutable evidence contract", () => {
  const hub = createProfessionalHub(hubInput);
  assert.equal(hub.identity.id, hubInput.identity.id);
  assert.deepEqual(hub.sourceEvidence, hubInput.sourceEvidence);
  assert.ok(Object.isFrozen(hub));
  assert.ok(Object.isFrozen(hub.identity));
  assert.ok(Object.isFrozen(hub.serviceArea));
  assert.equal(hub.executionAuthority, null);
});

test("professional hubs require evidence, jurisdiction, terms and freshness", () => {
  assert.throws(
    () => createProfessionalHub({ ...hubInput, sourceEvidence: [] }),
    /sourceEvidence must contain at least one reference/,
  );
  assert.throws(
    () => createProfessionalHub({ ...hubInput, jurisdiction: "" }),
    /jurisdiction must be a non-empty string/,
  );
  assert.throws(
    () => createProfessionalHub({ ...hubInput, freshness: { observedAt: "2026-10-07T00:00:00.000Z" } }),
    /freshness.reviewAt must be a non-empty string/,
  );
  assert.throws(
    () => createProfessionalHub({ ...hubInput, terms: { standing: "declared" } }),
    /terms.id must be a non-empty string/,
  );
  assert.throws(
    () => createProfessionalHub({
      ...hubInput,
      freshness: { ...hubInput.freshness, observedAt: "not-a-date" },
    }),
    /freshness.observedAt must be a valid date or timestamp/,
  );
});

test("unknown terms remain explicit without granting authority", () => {
  const hub = createProfessionalHub({
    ...hubInput,
    terms: { standing: "unknown" },
  });
  assert.deepEqual(hub.terms, { standing: "unknown" });
  assert.equal(hub.executionAuthority, null);
});
