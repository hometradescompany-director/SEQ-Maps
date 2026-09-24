import { createObservationEnvelope } from "../core/observation-envelope.mjs";

const SOURCE_REF = "qldtraffic:events:v2";
const LICENSE = Object.freeze({
  standing: "declared",
  id: "CC-BY-4.0",
});

function requireFeature(feature) {
  if (!feature || feature.type !== "Feature") {
    throw new TypeError("QLDTraffic event must be a GeoJSON Feature");
  }
  if (!feature.properties || typeof feature.properties !== "object") {
    throw new TypeError("QLDTraffic event properties are required");
  }
  return feature.properties;
}

function requireId(value) {
  if (value === null || value === undefined || value === "") {
    throw new TypeError("QLDTraffic event properties.id is required");
  }
  return String(value);
}

export function normalizeQldTrafficEvent(feature, { ingestedAt } = {}) {
  const properties = requireFeature(feature);
  const id = requireId(properties.id);

  if (!properties.duration?.start) {
    throw new TypeError("QLDTraffic event duration.start is required");
  }

  if (!properties.published) {
    throw new TypeError("QLDTraffic event published is required");
  }

  return createObservationEnvelope({
    id: `qldtraffic:event:${id}`,
    kind: "transport.incident.observed",
    sourceRef: SOURCE_REF,
    subjectRef: `qldtraffic:road-event:${id}`,
    validAt: properties.duration.start,
    knownAt: properties.published,
    ingestedAt,
    license: LICENSE,
    evidenceRef: properties.url ? String(properties.url) : null,
    payload: Object.freeze({
      status: properties.status ?? null,
      eventType: properties.event_type ?? null,
      eventSubtype: properties.event_subtype ?? null,
      eventDueTo: properties.event_due_to ?? null,
      eventPriority: properties.event_priority ?? null,
      description: properties.description ?? null,
      advice: properties.advice ?? null,
      information: properties.information ?? null,
      impact: properties.impact ?? null,
      roadSummary: properties.road_summary ?? null,
      lastUpdated: properties.last_updated ?? null,
      geometry: feature.geometry ?? null,
    }),
  });
}

export const QLDTRAFFIC_EVENTS_SOURCE = Object.freeze({
  ref: SOURCE_REF,
  provider: "Queensland Department of Transport and Main Roads",
  apiFamily: "QLDTraffic GeoJSON API",
  endpointPath: "/v2/events",
  license: LICENSE,
  auth: Object.freeze({
    type: "api_key",
    queryParameter: "apikey",
  }),
});
