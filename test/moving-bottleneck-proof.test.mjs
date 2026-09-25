import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateMovingBottleneckCandidate,
  DEFAULT_MOVING_BOTTLENECK_THRESHOLDS,
} from "../src/analytics/moving-bottleneck-proof.mjs";

const candidateWindow = {
  trackRef: "track:opaque:fixture-1",
  observedSeconds: 240,
  postedSpeedKph: 100,
  meanVehicleSpeedKph: 80,
  surroundingMedianSpeedKph: 96,
  nonLeftLaneRatio: 0.92,
  leftLaneAvailableRatio: 0.84,
  overtakingRatio: 0.05,
  followingQueueStart: 8,
  followingQueueEnd: 31,
};

test("flags a sustained isolated under-speed non-left-lane window as a candidate", () => {
  const result = evaluateMovingBottleneckCandidate(candidateWindow);
  assert.equal(result.candidate, true);
  assert.equal(result.postedSpeedDeltaKph, 20);
  assert.equal(result.surroundingSpeedDeltaKph, 16);
  assert.equal(result.followingQueueDeltaVehicles, 23);
  assert.equal(result.causalImpact, "not-established");
  assert.equal(result.enforcementStanding, "not-authorized");
});

test("does not blame one vehicle when surrounding flow is also slow", () => {
  const result = evaluateMovingBottleneckCandidate({
    ...candidateWindow,
    surroundingMedianSpeedKph: 84,
  });

  assert.equal(result.candidate, false);
  assert.equal(result.checks.surroundingSpeedDelta, false);
});

test("does not flag sustained overtaking as lane obstruction", () => {
  const result = evaluateMovingBottleneckCandidate({
    ...candidateWindow,
    overtakingRatio: 0.7,
  });

  assert.equal(result.candidate, false);
  assert.equal(result.checks.notMostlyOvertaking, false);
});

test("requires practical opportunity to move left", () => {
  const result = evaluateMovingBottleneckCandidate({
    ...candidateWindow,
    leftLaneAvailableRatio: 0.2,
  });

  assert.equal(result.candidate, false);
  assert.equal(result.checks.leftLaneAvailable, false);
});

test("requires a sustained observation window", () => {
  const result = evaluateMovingBottleneckCandidate({
    ...candidateWindow,
    observedSeconds: DEFAULT_MOVING_BOTTLENECK_THRESHOLDS.minObservedSeconds - 1,
  });

  assert.equal(result.candidate, false);
  assert.equal(result.checks.duration, false);
});

test("rejects invalid ratios instead of silently normalising them", () => {
  assert.throws(
    () =>
      evaluateMovingBottleneckCandidate({
        ...candidateWindow,
        nonLeftLaneRatio: 1.2,
      }),
    /must be between 0 and 1/
  );
});
