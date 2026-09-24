import test from "node:test";
import assert from "node:assert/strict";
import { createObservationEnvelope } from "../src/core/observation-envelope.mjs";

const base = {
  id: "obs:fixture:1",
  kind: "transport.condition.observed",
  sourceRef: "source:fixture",
  subjectRef: "road-segment:fixture",
  validAt: "2026-09-24T09:00:00.000Z",
  knownAt: "2026-09-24T09:00:05.000Z",
  ingestedAt: "2026-09-24T09:00:07.000Z",
  license: { standing: "declared", id: "CC-BY-4.0" },
  evidenceRef: "evidence:fixture:1",
  payload: { speedKph: 42 }
};

test("preserves all three time coordinates without collapsing them", () => {
  const observation = createObservationEnvelope(base);
  assert.equal(observation.validAt, base.validAt);
  assert.equal(observation.knownAt, base.knownAt);
  assert.equal(observation.ingestedAt, base.ingestedAt);
  assert.notEqual(observation.validAt, observation.knownAt);
  assert.ok(Object.isFrozen(observation));
});

test("rejects a missing temporal coordinate instead of inventing one", () => {
  const { validAt, ...withoutValidAt } = base;
  assert.throws(
    () => createObservationEnvelope(withoutValidAt),
    /validAt must be a non-empty string/
  );
});

test("requires an identifier when licence standing is declared", () => {
  assert.throws(
    () => createObservationEnvelope({
      ...base,
      license: { standing: "declared" }
    }),
    /license.id must be a non-empty string/
  );
});

test("allows unresolved licence standing to remain explicit", () => {
  const observation = createObservationEnvelope({
    ...base,
    license: { standing: "unknown" }
  });

  assert.deepEqual(observation.license, { standing: "unknown" });
});
