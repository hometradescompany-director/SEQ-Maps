import { createObservationEnvelope } from '../core/observation-envelope.mjs';

/** Offline contract owned by SEQ Maps. Export does not fetch or route traffic. */
export function exportTrafficObservations(observations) {
  if (!Array.isArray(observations)) throw new TypeError('observations must be an array');
  const seen = new Set();
  const normalized = observations.map(input => {
    const observation = createObservationEnvelope(input);
    if (seen.has(observation.id)) throw new TypeError(`duplicate observation id: ${observation.id}`);
    seen.add(observation.id);
    return structuredClone(observation);
  });
  return { contract: 'traffic-observations.v1', producer: 'hometradescompany-director/SEQ-Maps', observations: normalized };
}
