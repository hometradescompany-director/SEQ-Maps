import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  summarizeCorridorScenario,
  compareCorridorScenarios,
} from "../src/analytics/variable-speed-proof.mjs";

const fixture = JSON.parse(
  fs.readFileSync(
    new URL("./fixtures/m1-variable-speed.synthetic.json", import.meta.url),
    "utf8"
  )
);

test("synthetic fixture remains explicitly non-live", () => {
  assert.equal(fixture.standing, "synthetic-illustrative-only");
  assert.match(fixture.corridor, /not live Queensland traffic data/i);
});

test("summarises corridor throughput, queue, travel time and merge performance", () => {
  const summary = summarizeCorridorScenario(fixture.scenarios.posted_80);
  assert.deepEqual(summary.postedSpeedLimitsKph, [80]);
  assert.equal(summary.intervalCount, 4);
  assert.ok(summary.throughputVehicles > 0);
  assert.ok(summary.meanQueueVehicles > 0);
  assert.ok(summary.weightedMeanTravelTimeMinutes > 0);
  assert.ok(summary.mergeSuccessRatio > 0 && summary.mergeSuccessRatio <= 1);
});

test("comparison remains descriptive and does not claim causality", () => {
  const sixty = summarizeCorridorScenario(fixture.scenarios.posted_60);
  const eighty = summarizeCorridorScenario(fixture.scenarios.posted_80);
  const comparison = compareCorridorScenarios(sixty, eighty);

  // These inequalities belong only to the deliberately constructed fixture.
  assert.ok(comparison.throughputDeltaVehicles > 0);
  assert.ok(comparison.meanQueueDeltaVehicles < 0);
  assert.ok(comparison.travelTimeDeltaMinutes < 0);
  assert.ok(comparison.mergeSuccessDelta > 0);
  assert.equal(comparison.causalConclusion, "not-established");
});

test("rejects invalid merge ratios rather than silently normalising them", () => {
  assert.throws(
    () =>
      summarizeCorridorScenario([
        {
          durationMinutes: 15,
          postedSpeedKph: 80,
          flowVph: 4000,
          queueVehicles: 100,
          meanTravelTimeMinutes: 20,
          mergeAttempts: 100,
          mergeSuccessRatio: 1.1,
        },
      ]),
    /must be between 0 and 1/
  );
});
