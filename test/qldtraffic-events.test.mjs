import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { normalizeQldTrafficEvent, QLDTRAFFIC_EVENTS_SOURCE } from "../src/adapters/qldtraffic-events.mjs";

const fixture = JSON.parse(
  fs.readFileSync(new URL("./fixtures/qldtraffic-event.synthetic.json", import.meta.url), "utf8")
);

test("normalizes a QLDTraffic GeoJSON event without collapsing source times", () => {
  const ingestedAt = "2026-09-24T08:13:00+10:00";
  const observation = normalizeQldTrafficEvent(fixture, { ingestedAt });

  assert.equal(observation.id, "qldtraffic:event:900000001");
  assert.equal(observation.kind, "transport.incident.observed");
  assert.equal(observation.sourceRef, QLDTRAFFIC_EVENTS_SOURCE.ref);
  assert.equal(observation.subjectRef, "qldtraffic:road-event:900000001");
  assert.equal(observation.validAt, fixture.properties.duration.start);
  assert.equal(observation.knownAt, fixture.properties.published);
  assert.equal(observation.ingestedAt, ingestedAt);
  assert.deepEqual(observation.license, { standing: "declared", id: "CC-BY-4.0" });
  assert.equal(observation.payload.eventType, "Congestion");
  assert.equal(observation.payload.roadSummary.road_name, "Example Road");
});

test("fails when source validity time is absent rather than substituting ingestion time", () => {
  const copy = structuredClone(fixture);
  delete copy.properties.duration.start;

  assert.throws(
    () => normalizeQldTrafficEvent(copy, { ingestedAt: "2026-09-24T08:13:00+10:00" }),
    /duration.start is required/
  );
});

test("fails when published time is absent rather than inventing knownAt", () => {
  const copy = structuredClone(fixture);
  delete copy.properties.published;

  assert.throws(
    () => normalizeQldTrafficEvent(copy, { ingestedAt: "2026-09-24T08:13:00+10:00" }),
    /published is required/
  );
});

test("fixture remains explicitly synthetic and is never evidence of a live event", () => {
  assert.equal(fixture.properties.source.source_name, "Synthetic fixture");
  assert.equal(fixture.properties.information, "Not live QLDTraffic data.");
});
