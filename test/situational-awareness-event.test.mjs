import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  assessFeedFreshness,
  createSituationalAwarenessEvent,
  deduplicateSituationalAwarenessEvents,
  PUBLIC_EMERGENCY_GUIDANCE,
} from "../src/core/situational-awareness-event.mjs";

const smokeFixture = JSON.parse(
  fs.readFileSync(new URL("./fixtures/tanah-merah-smoke.synthetic.json", import.meta.url), "utf8")
);
const feedFixture = JSON.parse(
  fs.readFileSync(new URL("./fixtures/situational-awareness-feeds.synthetic.json", import.meta.url), "utf8")
);

function smokeEvent(overrides = {}) {
  return createSituationalAwarenessEvent({
    ...smokeFixture.event,
    ...overrides,
    location: { ...smokeFixture.event.location, ...overrides.location },
  });
}

test("Tanah Merah trigger is only an unverified, coarse smoke observation", () => {
  const event = smokeEvent();
  assert.equal(event.eventType, "smoke.observed");
  assert.equal(event.sourceType, "human_observation");
  assert.equal(event.verificationStatus, "unverified");
  assert.equal(event.confidence, "unassessed");
  assert.equal(event.sourceTimestampText, "2026-10-14 ~15:42 AEST");
  assert.equal(event.validAt, null);
  assert.equal(event.knownAt, "2026-10-14T15:42:00+10:00");
  assert.deepEqual(event.license, { standing: "unknown" });
  assert.equal(event.evidenceStatus, "not_provided");
  assert.deepEqual(event.location, {
    locality: "Tanah Merah",
    jurisdiction: "Logan, Queensland",
  });
  assert.equal(event.evidenceRef, null);
  assert.match(event.publicMessage, /does not confirm a fire, its origin, or current official warning status/);
  assert.ok(PUBLIC_EMERGENCY_GUIDANCE.length > 0);
  assert.match(smokeFixture.fixtureStatus, /not a live feed or independently verified incident/);
});

test("does not promote human observations to confirmed fires or inferred plumes", () => {
  assert.throws(
    () => smokeEvent({ eventType: "fire.confirmed" }),
    /official fire events require an official source and status/
  );
  assert.throws(
    () => smokeEvent({ eventType: "plume.inferred" }),
    /inferred plume events require a derived source/
  );
  assert.throws(
    () => smokeEvent({ verificationStatus: "official" }),
    /must remain explicitly unverified observations/
  );
});

test("keeps observation and official incident records separately identifiable", () => {
  const fire = createSituationalAwarenessEvent({
    ...smokeFixture.event,
    id: "official-fire:123",
    eventType: "fire.confirmed",
    sourceRef: "source:qld-fire-incidents",
    sourceType: "official_feed",
    verificationStatus: "official",
    evidenceStatus: "available",
    evidenceRef: "evidence:qld-fire:123",
  });
  const smoke = smokeEvent();
  assert.notEqual(smoke.eventType, fire.eventType);
  assert.notEqual(smoke.sourceRef, fire.sourceRef);
  assert.deepEqual(deduplicateSituationalAwarenessEvents([smoke, fire]), [smoke, fire]);
});

test("preserves source timezone offsets and compares equivalent instants", () => {
  const offsetTime = "2026-10-14T15:42:00+10:00";
  const utcTime = "2026-10-14T05:42:00Z";
  const event = smokeEvent({ knownAt: offsetTime });
  assert.equal(event.knownAt, offsetTime);
  assert.equal(Date.parse(event.knownAt), Date.parse(utcTime));
  assert.throws(() => smokeEvent({ knownAt: "2026-10-14T15:42:00" }), /include an ISO timestamp and timezone/);
});

test("deduplicates exact replay but rejects conflicting records with the same id", () => {
  const event = smokeEvent();
  assert.deepEqual(deduplicateSituationalAwarenessEvents([event, event]), [event]);
  assert.throws(
    () => deduplicateSituationalAwarenessEvents([event, smokeEvent({ confidence: "low" })]),
    /conflicting situational-awareness events share id/
  );
});

test("corrections link to, but do not replace, the original observation", () => {
  const original = smokeEvent();
  const correction = smokeEvent({
    id: "observation:tanah-merah-smoke:correction-1",
    knownAt: "2026-10-14T16:15:00+10:00",
    correctionOf: original.id,
  });
  const events = deduplicateSituationalAwarenessEvents([original, correction]);
  assert.equal(events.length, 2);
  assert.equal(events[0].correctionOf, null);
  assert.equal(events[1].correctionOf, original.id);
});

test("withdrawals remain explicit and do not silently delete the original record", () => {
  const original = smokeEvent();
  const withdrawal = smokeEvent({
    id: "observation:tanah-merah-smoke:withdrawal-1",
    eventType: "observation.retracted",
    knownAt: "2026-10-14T16:20:00+10:00",
    retracts: original.id,
  });
  const events = deduplicateSituationalAwarenessEvents([original, withdrawal]);
  assert.equal(events.length, 2);
  assert.equal(events[1].retracts, original.id);
});

test("marks stale and unavailable candidate feeds instead of implying fresh data", () => {
  const [unavailable, stale] = feedFixture.feeds;
  assert.deepEqual(
    assessFeedFreshness({
      ...unavailable,
      maxAgeMs: 900000,
    }),
    { status: "unavailable" }
  );
  assert.equal(assessFeedFreshness(stale).status, "stale");
  assert.match(feedFixture.fixtureStatus, /no live feed was polled/);
  assert.equal(
    assessFeedFreshness({
      state: "available",
      checkedAt: "2026-10-14T22:59:09Z",
      lastSuccessfulAt: "2026-10-14T22:58:00Z",
      maxAgeMs: 900000,
    }).status,
    "fresh"
  );
});
