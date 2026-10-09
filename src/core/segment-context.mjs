import { createObservationEnvelope } from "./observation-envelope.mjs";
import { contextTimestamp as timestamp } from "./context-timestamp.mjs";

// Owner: SEQ Maps transport core. Owns asserted relationships and derivation
// events; reads caller-owned observations. The context API consumes the projection.
function reference(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value;
}

function freeze(value) {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function createSegmentBinding(input) {
  if (!input || !Array.isArray(input.evidenceRefs) || !input.evidenceRefs.length) {
    throw new TypeError("binding evidenceRefs must contain alignment evidence");
  }
  if ((input.method != null && input.method !== "supplied-reference")
      || (input.standing != null && input.standing !== "asserted")) {
    throw new TypeError("binding must remain an asserted supplied-reference relationship");
  }
  return freeze({
    id: reference(input.id, "binding.id"),
    observationRef: reference(input.observationRef, "observationRef"),
    segmentRef: reference(input.segmentRef, "segmentRef"),
    actorRef: reference(input.actorRef, "actorRef"),
    recordedAt: timestamp(input.recordedAt, "binding.recordedAt"),
    evidenceRefs: [...new Set(Array.from(input.evidenceRefs, ref => reference(ref, "evidenceRef")))],
    method: "supplied-reference",
    standing: "asserted",
  });
}

export function createTransportEvent(input) {
  if (!input) throw new TypeError("transport event input is required");
  const observation = createObservationEnvelope(input.observation);
  const binding = createSegmentBinding(input.binding);
  if (binding.observationRef !== observation.id) {
    throw new TypeError("binding observation reference does not match observation");
  }
  if (!["transport.condition.observed", "transport.incident.observed"].includes(observation.kind)) {
    throw new TypeError("unsupported transport observation kind");
  }
  const id = reference(input.id, "event.id");
  const supersedesRef = input.supersedesRef == null
    ? null : reference(input.supersedesRef, "supersedesRef");
  if (id === supersedesRef) throw new TypeError("invalid self supersession");
  return freeze({
    id, kind: observation.kind, observationRef: observation.id, bindingRef: binding.id,
    actorRef: reference(input.actorRef, "actorRef"),
    recordedAt: timestamp(input.recordedAt, "event.recordedAt"),
    supersedesRef,
  });
}

function index(records, field, validate) {
  if (!Array.isArray(records)) throw new TypeError(`${field} must be an array`);
  const result = new Map();
  for (const record of records) {
    const validated = validate(record);
    if (result.has(validated.id)) throw new TypeError(`duplicate ${field} identity`);
    result.set(validated.id, validated);
  }
  return result;
}

/** Rebuild a bounded read model. Never mutate the input ledger or select by recency. */
export function projectSegmentContext({ observations, bindings, events, segmentRef, asOf } = {}) {
  reference(segmentRef, "segmentRef");
  timestamp(asOf, "asOf");
  const instant = Date.parse(asOf);
  const observationIndex = index(observations, "observations", record => {
    const observation = createObservationEnvelope(record);
    for (const field of ["validAt", "knownAt", "ingestedAt"]) timestamp(observation[field], field);
    return observation;
  });
  const bindingIndex = index(bindings, "bindings", createSegmentBinding);
  // Resolve every relationship: an incomplete ledger must never masquerade as no traffic.
  for (const binding of bindingIndex.values()) {
    if (!observationIndex.has(binding.observationRef)) {
      throw new TypeError("unresolved binding observation reference");
    }
  }
  const eventIndex = index(events, "events", record => {
    const observation = observationIndex.get(record.observationRef);
    const binding = bindingIndex.get(record.bindingRef);
    if (!observation || !binding) throw new TypeError("unresolved event reference");
    const event = createTransportEvent({ ...record, observation, binding });
    if (record.kind !== event.kind) throw new TypeError("event kind does not match observation");
    return event;
  });
  for (const event of eventIndex.values()) {
    if (!event.supersedesRef) continue;
    const previous = eventIndex.get(event.supersedesRef);
    if (!previous || Date.parse(previous.recordedAt) >= Date.parse(event.recordedAt)) {
      throw new TypeError("invalid supersession reference or chronology");
    }
    const before = observationIndex.get(previous.observationRef);
    const after = observationIndex.get(event.observationRef);
    if (before.sourceRef !== after.sourceRef || before.subjectRef !== after.subjectRef
        || bindingIndex.get(previous.bindingRef).segmentRef !== bindingIndex.get(event.bindingRef).segmentRef) {
      throw new TypeError("supersession must preserve source, subject and segment");
    }
  }
  const visible = [...eventIndex.values()].filter(event => {
    const observation = observationIndex.get(event.observationRef);
    const binding = bindingIndex.get(event.bindingRef);
    return binding.segmentRef === segmentRef
      && [event.recordedAt, binding.recordedAt, observation.validAt, observation.knownAt, observation.ingestedAt]
        .every(time => Date.parse(time) <= instant);
  });
  const visibleRefs = new Set(visible.map(event => event.id));
  const superseded = new Set(visible.filter(event => visibleRefs.has(event.supersedesRef))
    .map(event => event.supersedesRef));
  const active = visible.filter(event => !superseded.has(event.id))
    .sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0);
  const roots = new Set();
  const subjects = new Set();
  let competingCorrections = false;
  for (const event of active) {
    let root = event;
    while (root.supersedesRef) root = eventIndex.get(root.supersedesRef);
    if (roots.has(root.id)) competingCorrections = true;
    roots.add(root.id);
    const observation = observationIndex.get(event.observationRef);
    const subject = JSON.stringify([observation.sourceRef, observation.subjectRef]);
    if (subjects.has(subject)) competingCorrections = true;
    subjects.add(subject);
  }
  const claims = active.map(event => {
    const observation = observationIndex.get(event.observationRef);
    const binding = bindingIndex.get(event.bindingRef);
    return {
      eventRef: event.id, observationRef: observation.id, subjectRef: observation.subjectRef,
      sourceRef: observation.sourceRef, bindingRef: binding.id,
      bindingStanding: binding.standing, bindingEvidenceRefs: binding.evidenceRefs,
      actorRef: event.actorRef, bindingActorRef: binding.actorRef,
      kind: event.kind,
      times: { validAt: observation.validAt, knownAt: observation.knownAt,
        ingestedAt: observation.ingestedAt, recordedAt: event.recordedAt,
        bindingRecordedAt: binding.recordedAt },
      license: observation.license,
      evidence: observation.evidenceRef
        ? { state: "known", ref: observation.evidenceRef }
        : { state: "unknown", reason: "source observation has no evidence reference" },
      payload: observation.payload,
    };
  });
  // Clone at the projection boundary so nested source payloads cannot mutate a read.
  return freeze(structuredClone({
    version: "SegmentContext/v1", segmentRef, asOf,
    standing: !claims.length ? "searched_no_match" : competingCorrections ? "contradictory" : "observed",
    claims, supersededEventRefs: [...superseded].sort(),
    causalConclusion: "not-established", enforcementStanding: "not-authorized",
  }));
}
