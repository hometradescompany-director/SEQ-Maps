import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { normalizeQldTrafficEvent } from "../src/adapters/qldtraffic-events.mjs";

const core = await import("../src/core/segment-context.mjs").catch(() => ({}));
const fixture = JSON.parse(fs.readFileSync(new URL("./fixtures/qldtraffic-event.synthetic.json", import.meta.url)));
const time = "2026-09-24T23:00:00.000Z";
const observed = normalizeQldTrafficEvent(fixture, { ingestedAt: time });
const bindingInput = {
  id: "binding:synthetic:1", observationRef: observed.id,
  segmentRef: "segment:synthetic:1", actorRef: "actor:fixture",
  recordedAt: time, evidenceRefs: ["evidence:synthetic:alignment"],
};
const eventInput = { id: "event:1", observation: observed, actorRef: "actor:fixture", recordedAt: time };

test("explicit binding preserves evidence and asserts no spatial verification", () => {
  assert.equal(typeof core.createSegmentBinding, "function");
  const input = structuredClone(bindingInput);
  const binding = core.createSegmentBinding(input);
  input.evidenceRefs.push("later");
  assert.deepEqual(binding.evidenceRefs, bindingInput.evidenceRefs);
  assert.equal(binding.standing, "asserted");
  assert.equal(binding.method, "supplied-reference");
  assert.ok(Object.isFrozen(binding.evidenceRefs));
});

test("bindings reject guesses, blank references, invalid times and missing alignment evidence", () => {
  assert.equal(typeof core.createSegmentBinding, "function");
  for (const change of [
    { segmentRef: " " }, { actorRef: "" }, { recordedAt: "yesterday" },
    { evidenceRefs: [] }, { evidenceRefs: [""] },
    { method: "nearest-road-guess" }, { standing: "verified" },
    { evidenceRefs: Array(1) }, { recordedAt: "2026-02-30T00:00:00Z" },
  ]) assert.throws(() => core.createSegmentBinding({ ...bindingInput, ...change }), TypeError);
});

test("transport event relates source observation and binding without copying payload", () => {
  assert.equal(typeof core.createTransportEvent, "function");
  const binding = core.createSegmentBinding(bindingInput);
  const event = core.createTransportEvent({ ...eventInput, binding });
  assert.equal(event.observationRef, observed.id);
  assert.equal(event.bindingRef, binding.id);
  assert.equal(event.kind, "transport.incident.observed");
  assert.equal(event.payload, undefined);
  assert.equal(event.supersedesRef, null);
  assert.ok(Object.isFrozen(event));
  assert.throws(() => core.createTransportEvent({
    ...eventInput, binding: { ...binding, observationRef: "another-observation" },
  }), /observation/);
});

function ledger() {
  const binding = core.createSegmentBinding(bindingInput);
  const event = core.createTransportEvent({ ...eventInput, binding });
  return { observations: [observed], bindings: [binding], events: [event] };
}

test("projection replays a source observation through an explicit segment relationship", () => {
  assert.equal(typeof core.projectSegmentContext, "function");
  const input = ledger();
  const original = structuredClone(input);
  const context = core.projectSegmentContext({ ...input, segmentRef: bindingInput.segmentRef, asOf: time });
  assert.equal(context.version, "SegmentContext/v1");
  assert.equal(context.standing, "observed");
  assert.equal(context.claims[0].bindingStanding, "asserted");
  assert.deepEqual(context.claims[0].times, {
    validAt: observed.validAt, knownAt: observed.knownAt,
    ingestedAt: observed.ingestedAt, recordedAt: time, bindingRecordedAt: time,
  });
  assert.deepEqual(context.claims[0].license, observed.license);
  assert.equal(context.claims[0].evidence.state, "known");
  assert.equal(context.claims[0].payload.eventType, "Congestion");
  assert.equal(context.causalConclusion, "not-established");
  assert.equal(context.enforcementStanding, "not-authorized");
  assert.deepEqual(input, original);
  assert.ok(Object.isFrozen(context.claims[0].payload.geometry.geometries[0].coordinates));
  assert.throws(() => { context.claims[0].payload.geometry.geometries[0].coordinates[0] = 0; }, TypeError);
});

test("unreconciled revisions of the same source subject remain contradictory without implicit latest wins", () => {
  const input = ledger();
  input.events.push({ ...input.events[0], id: "event:unreconciled" });
  const context = core.projectSegmentContext({ ...input, segmentRef: bindingInput.segmentRef, asOf: time });
  assert.equal(context.standing, "contradictory");
  assert.equal(context.claims.length, 2);
});

test("as-of replay does not leak conditions, source knowledge, ingestion or relationships from the future", () => {
  assert.equal(typeof core.projectSegmentContext, "function");
  const before = "2026-09-24T22:59:59.999Z";
  assert.equal(core.projectSegmentContext({
    ...ledger(), segmentRef: bindingInput.segmentRef, asOf: before,
  }).standing, "searched_no_match");
  for (const field of ["validAt", "knownAt", "ingestedAt"]) {
    const input = ledger();
    input.observations = [{ ...observed, [field]: "2026-09-25T00:00:00Z" }];
    assert.equal(core.projectSegmentContext({
      ...input, segmentRef: bindingInput.segmentRef, asOf: time,
    }).claims.length, 0);
  }
  for (const field of ["bindings", "events"]) {
    const input = ledger();
    input[field] = [{ ...input[field][0], recordedAt: "2026-09-25T00:00:00Z" }];
    assert.equal(core.projectSegmentContext({
      ...input, segmentRef: bindingInput.segmentRef, asOf: time,
    }).claims.length, 0);
  }
});

test("explicit corrections preserve history and competing corrections stay visible", () => {
  assert.equal(typeof core.projectSegmentContext, "function");
  const input = ledger();
  const later = "2026-09-25T00:00:00Z";
  const correction = { ...input.events[0], id: "event:2", recordedAt: later, supersedesRef: "event:1" };
  input.events.push(correction);
  const read = (asOf) => core.projectSegmentContext({ ...input, segmentRef: bindingInput.segmentRef, asOf });
  assert.deepEqual(read(time).claims.map(c => c.eventRef), ["event:1"]);
  assert.deepEqual(read(later).claims.map(c => c.eventRef), ["event:2"]);
  assert.deepEqual(read(later).supersededEventRefs, ["event:1"]);
  input.events.push({ ...correction, id: "event:3" });
  assert.equal(read(later).standing, "contradictory");
  assert.deepEqual(read(later).claims.map(c => c.eventRef), ["event:2", "event:3"]);
  assert.deepEqual(read(later), core.projectSegmentContext({
    ...input, events: [...input.events].reverse(), segmentRef: bindingInput.segmentRef, asOf: later,
  }));
});

test("missing source evidence and unknown licence standing survive projection", () => {
  assert.equal(typeof core.projectSegmentContext, "function");
  const input = ledger();
  input.observations = [{ ...observed, evidenceRef: null, license: { standing: "unknown" } }];
  const context = core.projectSegmentContext({ ...input, segmentRef: bindingInput.segmentRef, asOf: time });
  assert.equal(context.claims[0].evidence.state, "unknown");
  assert.equal(context.claims[0].license.standing, "unknown");
});

test("broken references, duplicate identities, invalid supersession and missing time fail explicitly", () => {
  assert.equal(typeof core.projectSegmentContext, "function");
  const read = (input) => core.projectSegmentContext({
    ...input, segmentRef: bindingInput.segmentRef, asOf: time,
  });
  assert.throws(() => read({ ...ledger(), observations: [] }), /reference/);
  const duplicate = ledger();
  duplicate.events.push(duplicate.events[0]);
  assert.throws(() => read(duplicate), /duplicate/);
  const invalid = ledger();
  invalid.events.push({ ...invalid.events[0], id: "event:2", supersedesRef: "missing" });
  assert.throws(() => read(invalid), /supersession/);
  assert.throws(() => read({ ...ledger(), events: [{ ...ledger().events[0], supersedesRef: "event:1" }] }), /supersession/);
  assert.throws(() => core.projectSegmentContext({ ...ledger(), segmentRef: bindingInput.segmentRef }), /asOf/);
});
