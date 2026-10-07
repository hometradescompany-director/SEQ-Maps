import assert from "node:assert/strict";
import test from "node:test";
import {
  createProfessionalEntity,
  projectProfessionalRole,
} from "../src/core/professional-hub.mjs";

const record = {
  id: "professional:fixture:1",
  identity: { name: "Example professional" },
  profession: "surveyor",
  roles: ["surveyor", "land-surveyor"],
  jurisdiction: "Queensland",
  registrationRefs: [{ authorityRef: "authority:fixture", registrationId: "123" }],
  capabilities: ["boundary-survey"],
  sourceEvidence: [{ sourceRef: "source:fixture", evidenceRef: "evidence:fixture" }],
};

test("professional entities preserve source evidence and expose immutable role projections", () => {
  const entity = createProfessionalEntity(record);
  const role = projectProfessionalRole(entity, "land-surveyor");

  assert.equal(entity.sourceEvidence[0].sourceRef, "source:fixture");
  assert.equal(role.profession, "land-surveyor");
  assert.equal(entity.profession, "surveyor");
  assert.ok(Object.isFrozen(entity));
  assert.ok(Object.isFrozen(entity.sourceEvidence));
  assert.ok(Object.isFrozen(entity.sourceEvidence[0]));
});

test("professional entities require a sourced identity and profession", () => {
  assert.throws(
    () => createProfessionalEntity({ ...record, sourceEvidence: [] }),
    /sourceEvidence/,
  );
  assert.throws(
    () => createProfessionalEntity({ ...record, profession: "  " }),
    /profession/,
  );
  assert.throws(
    () => createProfessionalEntity({ ...record, identity: {} }),
    /identity.name/,
  );
  assert.throws(
    () => projectProfessionalRole(createProfessionalEntity(record), "engineer"),
    /listed in the entity roles/,
  );
});
