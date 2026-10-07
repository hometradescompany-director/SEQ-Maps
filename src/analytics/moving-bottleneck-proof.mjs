function finite(value, field) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${field} must be a finite number`);
  }
  return value;
}

function ratio(value, field) {
  finite(value, field);
  if (value < 0 || value > 1) {
    throw new TypeError(`${field} must be between 0 and 1`);
  }
  return value;
}

function nonNegative(value, field) {
  finite(value, field);
  if (value < 0) {
    throw new TypeError(`${field} must be >= 0`);
  }
  return value;
}

export const DEFAULT_MOVING_BOTTLENECK_THRESHOLDS = Object.freeze({
  minObservedSeconds: 120,
  minPostedSpeedDeltaKph: 15,
  minSurroundingSpeedDeltaKph: 10,
  minNonLeftLaneRatio: 0.8,
  minLeftLaneAvailableRatio: 0.6,
  maxOvertakingRatio: 0.2,
});

/**
 * Evaluate one already-observed anonymous traffic window.
 *
 * This is a descriptive candidate detector only. It does not establish
 * causality, legal liability or enforcement standing.
 */
export function evaluateMovingBottleneckCandidate(
  window,
  thresholds = DEFAULT_MOVING_BOTTLENECK_THRESHOLDS
) {
  if (!window || typeof window !== "object") {
    throw new TypeError("window is required");
  }

  const trackRef =
    typeof window.trackRef === "string" && window.trackRef.trim()
      ? window.trackRef
      : (() => { throw new TypeError("trackRef must be a non-empty string"); })();

  const observedSeconds = nonNegative(window.observedSeconds, "observedSeconds");
  const postedSpeedKph = nonNegative(window.postedSpeedKph, "postedSpeedKph");
  const meanVehicleSpeedKph = nonNegative(window.meanVehicleSpeedKph, "meanVehicleSpeedKph");
  const surroundingMedianSpeedKph = nonNegative(
    window.surroundingMedianSpeedKph,
    "surroundingMedianSpeedKph"
  );
  const nonLeftLaneRatio = ratio(window.nonLeftLaneRatio, "nonLeftLaneRatio");
  const leftLaneAvailableRatio = ratio(
    window.leftLaneAvailableRatio,
    "leftLaneAvailableRatio"
  );
  const overtakingRatio = ratio(window.overtakingRatio, "overtakingRatio");
  const followingQueueStart = nonNegative(window.followingQueueStart, "followingQueueStart");
  const followingQueueEnd = nonNegative(window.followingQueueEnd, "followingQueueEnd");

  const postedSpeedDeltaKph = postedSpeedKph - meanVehicleSpeedKph;
  const surroundingSpeedDeltaKph = surroundingMedianSpeedKph - meanVehicleSpeedKph;
  const followingQueueDeltaVehicles = followingQueueEnd - followingQueueStart;

  const checks = Object.freeze({
    duration: observedSeconds >= thresholds.minObservedSeconds,
    postedSpeedDelta: postedSpeedDeltaKph >= thresholds.minPostedSpeedDeltaKph,
    surroundingSpeedDelta:
      surroundingSpeedDeltaKph >= thresholds.minSurroundingSpeedDeltaKph,
    nonLeftLane: nonLeftLaneRatio >= thresholds.minNonLeftLaneRatio,
    leftLaneAvailable:
      leftLaneAvailableRatio >= thresholds.minLeftLaneAvailableRatio,
    notMostlyOvertaking: overtakingRatio <= thresholds.maxOvertakingRatio,
  });

  return Object.freeze({
    trackRef,
    observedSeconds,
    postedSpeedDeltaKph,
    surroundingSpeedDeltaKph,
    nonLeftLaneRatio,
    leftLaneAvailableRatio,
    overtakingRatio,
    followingQueueDeltaVehicles,
    candidate: Object.values(checks).every(Boolean),
    checks,
    causalImpact: "not-established",
    enforcementStanding: "not-authorized",
  });
}
