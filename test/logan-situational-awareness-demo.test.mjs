import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  assessFeedFreshness,
  createSituationalAwarenessEvent,
} from "../src/core/situational-awareness-event.mjs";

const page = fs.readFileSync(
  new URL("../demo/logan-situational-awareness.html", import.meta.url),
  "utf8"
);
const smokeFixture = JSON.parse(
  fs.readFileSync(new URL("./fixtures/tanah-merah-smoke.synthetic.json", import.meta.url), "utf8")
);
const feedFixture = JSON.parse(
  fs.readFileSync(new URL("./fixtures/situational-awareness-feeds.synthetic.json", import.meta.url), "utf8")
);

test("Logan demonstration presents synthetic human observations as unverified", () => {
  const event = createSituationalAwarenessEvent(smokeFixture.event);
  assert.match(page, /Synthetic demonstration · not live data/);
  assert.match(page, /Synthetic fixture/);
  assert.match(page, /Unverified human report/);
  assert.match(page, /does not confirm a fire, its origin, or current official warning status/);
  assert.match(page, new RegExp(event.sourceRef.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(page, new RegExp(event.sourceTimestampText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(page, /Confidence[\s\S]*?Unassessed/);
  assert.match(page, /Licence standing[\s\S]*?Unknown; not cleared for redistribution/);
  assert.match(page, /Expired demonstration observation/);
  assert.match(page, /Evidence[\s\S]*?Not provided/);
});

test("official-source, stale, and unavailable examples stay distinct", () => {
  const [unavailable, stale] = feedFixture.feeds;
  assert.equal(assessFeedFreshness({ ...unavailable, maxAgeMs: 900_000 }).status, "unavailable");
  assert.equal(assessFeedFreshness(stale).status, "stale");
  assert.match(page, /Official-source example/);
  assert.match(page, /No official event loaded/);
  assert.match(page, /No official incident records are supplied or implied/);
  assert.match(page, /Unavailable in this demonstration/);
  assert.match(page, /Stale synthetic status example/);
  assert.match(page, /No air-quality reading is displayed/);
});

test("the page exposes official guidance without personal or private data", () => {
  assert.match(page, /Queensland current incidents/);
  assert.match(page, /Queensland smoke and dust health information/);
  assert.match(page, /Queensland bushfire safety/);
  assert.match(page, /no reporter identity, street address, precise location, or private fleet\/site records/);
  assert.doesNotMatch(JSON.stringify(smokeFixture.event), /reporter|latitude|longitude|fleet|streetAddress/i);
  assert.doesNotMatch(page, /<script\b|<iframe\b|<img\b|googleapis\.com|maps\.google/i);
});

test("the demonstration has mobile and keyboard-accessible document structure", () => {
  assert.match(page, /<html lang="en">/);
  assert.match(page, /name="viewport" content="width=device-width, initial-scale=1"/);
  assert.match(page, /<a class="skip-link" href="#main">Skip to demonstration<\/a>/);
  assert.match(page, /<main id="main">/);
  assert.match(page, /<h1>Logan situational awareness<\/h1>/);
  assert.match(page, /:focus-visible/);
  assert.match(page, /@media \(max-width: 36rem\)/);
  assert.match(page, /grid-template-columns: 1fr/);
});
