import { assessObservationFreshness } from "../observation-freshness.mjs";
/**
 * Projection gate, not an ingestion gate: preserve historical observations
 * while excluding stale evidence from live traffic decisions. Freshness uses
 * validAt, not the later knowledge or ingestion timestamps.
 */
export function evaluateLiveObservation(envelope, {nowMs, maxAgeMs}) {
  const freshness = assessObservationFreshness({
    source: envelope?.sourceRef,
    licence: envelope?.license?.standing === "declared" ? envelope.license.id : "",
    observedAt: envelope?.validAt,
  }, nowMs, maxAgeMs);
  return {eligible: freshness.usable, reason: freshness.reason, observationId: envelope?.id ?? null};
}
