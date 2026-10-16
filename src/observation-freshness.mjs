export function assessObservationFreshness(observation, nowMs, maxAgeMs) {
  if (!Number.isFinite(nowMs) || !Number.isFinite(maxAgeMs) || maxAgeMs < 0) return {usable:false,reason:"invalid_policy"};
  if (!observation || typeof observation !== "object") return {usable:false,reason:"missing_observation"};
  if (typeof observation.source !== "string" || !observation.source.trim()) return {usable:false,reason:"missing_source"};
  if (typeof observation.licence !== "string" || !observation.licence.trim()) return {usable:false,reason:"missing_licence"};
  if (typeof observation.observedAt !== "string" || !/^\d{4}-\d\d-\d\dT/.test(observation.observedAt)) return {usable:false,reason:"invalid_time"};
  const time = Date.parse(observation.observedAt);
  if (!Number.isFinite(time)) return {usable:false,reason:"invalid_time"};
  if (time > nowMs) return {usable:false,reason:"future_observation"};
  if (nowMs - time > maxAgeMs) return {usable:false,reason:"stale_observation"};
  return {usable:true,reason:"fresh"};
}
