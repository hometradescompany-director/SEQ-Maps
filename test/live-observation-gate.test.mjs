import test from "node:test";import assert from "node:assert/strict";
import fs from "node:fs";
import { normalizeQldTrafficEvent } from "../src/adapters/qldtraffic-events.mjs";
import { createObservationEnvelope } from "../src/core/observation-envelope.mjs";
import { evaluateLiveObservation } from "../src/core/live-observation-gate.mjs";
const envelope=createObservationEnvelope({id:"event:1",kind:"transport.incident.observed",sourceRef:"qldtraffic",subjectRef:"road:1",validAt:"2026-10-16T09:00:00Z",knownAt:"2026-10-16T10:00:00Z",ingestedAt:"2026-10-16T10:01:00Z",license:{standing:"declared",id:"CC-BY-4.0"}});
const qldTrafficFixture = JSON.parse(fs.readFileSync(new URL("./fixtures/qldtraffic-event.synthetic.json", import.meta.url), "utf8"));
test("live projection accepts a current attributed envelope",()=>assert.equal(evaluateLiveObservation(envelope,{nowMs:Date.parse(envelope.knownAt),maxAgeMs:60000}).eligible,true));
test("live projection rejects stale envelope without deleting archival evidence",()=>{const result=evaluateLiveObservation(envelope,{nowMs:Date.parse(envelope.knownAt)+60001,maxAgeMs:60000});assert.equal(result.reason,"stale_observation");assert.equal(envelope.id,"event:1")});
test("unknown licence cannot enter live projection",()=>assert.equal(evaluateLiveObservation({...envelope,license:{standing:"unknown"}},{nowMs:Date.parse(envelope.knownAt),maxAgeMs:60000}).eligible,false));
test("synthetic QLDTraffic normalization feeds the live projection gate", () => {
  const normalized = normalizeQldTrafficEvent(qldTrafficFixture, {
    ingestedAt: "2026-09-24T08:13:00+10:00",
  });
  const nowMs = Date.parse(normalized.knownAt);

  assert.equal(
    evaluateLiveObservation(normalized, { nowMs, maxAgeMs: 60_000 }).eligible,
    true,
  );
  assert.equal(
    evaluateLiveObservation(normalized, { nowMs: nowMs + 60_001, maxAgeMs: 60_000 }).reason,
    "stale_observation",
  );
});
