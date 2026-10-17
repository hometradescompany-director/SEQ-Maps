import { assessObservationFreshness } from "../observation-freshness.mjs";
/**
 * Projection gate, not an ingestion gate: preserve historical observations
 * while excluding stale evidence from live traffic decisions.
 */
export function evaluateLiveObservation(envelope, {nowMs, maxAgeMs}) {
  const freshness = assessObservationFreshness({
    source: envelope?.sourceRef,
    licence: envelope?.license?.standing === "declared" ? envelope.license.id : "",
    observedAt: envelope?.knownAt,
  }, nowMs, maxAgeMs);
  return {eligible: freshness.usable, reason: freshness.reason, observationId: envelope?.id ?? null};
}
