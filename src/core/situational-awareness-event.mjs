import { isDeepStrictEqual } from "node:util";

const EVENT_TYPES = new Set([
  "smoke.observed",
  "fire.confirmed",
  "burn.prescribed",
  "plume.inferred",
  "air_quality.observed",
  "weather.wind.observed",
  "fire.warning.issued",
  "observation.retracted",
]);
const SOURCE_TYPES = new Set([
  "human_observation",
  "official_feed",
  "air_quality_sensor",
  "weather_station",
  "derived",
]);
const CONFIDENCE_LEVELS = new Set(["unassessed", "low", "medium", "high"]);
const VERIFICATION_STATUSES = new Set(["unverified", "corroborated", "official"]);
const LICENSE_STANDINGS = new Set(["declared", "missing", "unknown"]);
const EVIDENCE_STATUSES = new Set(["available", "not_provided", "revoked"]);

export const PUBLIC_EMERGENCY_GUIDANCE = Object.freeze([
  Object.freeze({
    label: "Queensland current incidents",
    url: "https://www.fire.qld.gov.au/Current-Incidents",
  }),
  Object.freeze({
    label: "Queensland smoke and dust health information",
    url: "https://apps.des.qld.gov.au/air-quality/health/",
  }),
  Object.freeze({
    label: "Queensland bushfire safety",
    url: "https://www.qld.gov.au/emergency/dealing-disasters/disaster-types/bushfires",
  }),
]);

function requiredString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value;
}

function timestamp(value, field, { nullable = false } = {}) {
  if (nullable && value === null) return null;
  requiredString(value, field);
  if (!/(?:Z|[+-]\d{2}:\d{2})$/i.test(value) || Number.isNaN(Date.parse(value))) {
    throw new TypeError(`${field} must include an ISO timestamp and timezone`);
  }
  return value;
}

function normalizeLicense(license) {
  if (!license || !LICENSE_STANDINGS.has(license.standing)) {
    throw new TypeError("license.standing must be declared, missing or unknown");
  }
  if (license.standing === "declared") requiredString(license.id, "license.id");
  return Object.freeze({
    standing: license.standing,
    ...(license.id ? { id: license.id } : {}),
  });
}

export function createSituationalAwarenessEvent(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("event input is required");
  }

  if (!EVENT_TYPES.has(input.eventType)) {
    throw new TypeError("eventType is not a supported situational-awareness type");
  }
  if (!SOURCE_TYPES.has(input.sourceType)) {
    throw new TypeError("sourceType is not supported");
  }
  if (!CONFIDENCE_LEVELS.has(input.confidence)) {
    throw new TypeError("confidence must be unassessed, low, medium or high");
  }
  if (!VERIFICATION_STATUSES.has(input.verificationStatus)) {
    throw new TypeError("verificationStatus is not supported");
  }
  if (input.eventType === "smoke.observed"
    && (input.sourceType !== "human_observation" || input.verificationStatus !== "unverified")) {
    throw new TypeError("human smoke reports must remain explicitly unverified observations");
  }
  if (["fire.confirmed", "fire.warning.issued", "burn.prescribed"].includes(input.eventType)
    && (input.sourceType !== "official_feed" || input.verificationStatus !== "official")) {
    throw new TypeError("official fire events require an official source and status");
  }
  if (input.eventType === "plume.inferred" && input.sourceType !== "derived") {
    throw new TypeError("inferred plume events require a derived source");
  }
  if (input.eventType === "observation.retracted" && !input.retracts) {
    throw new TypeError("retracted observations require a retracts reference");
  }

  if (!input.location || typeof input.location !== "object") {
    throw new TypeError("coarse location is required");
  }
  const locationFields = Object.keys(input.location);
  if (locationFields.some((field) => !["locality", "jurisdiction"].includes(field))) {
    throw new TypeError("location may contain only locality and jurisdiction");
  }

  if (!EVIDENCE_STATUSES.has(input.evidenceStatus)) {
    throw new TypeError("evidenceStatus must be available, not_provided or revoked");
  }
  if (input.evidenceStatus === "available" && !input.evidenceRef) {
    throw new TypeError("available evidence requires an evidenceRef");
  }
  if (input.evidenceStatus !== "available" && input.evidenceRef !== null) {
    throw new TypeError("unavailable or revoked evidence must not expose an evidenceRef");
  }

  const event = {
    id: requiredString(input.id, "id"),
    eventType: input.eventType,
    sourceRef: requiredString(input.sourceRef, "sourceRef"),
    sourceType: input.sourceType,
    sourceTimestampText: input.sourceTimestampText === null || input.sourceTimestampText === undefined
      ? null
      : requiredString(input.sourceTimestampText, "sourceTimestampText"),
    validAt: timestamp(input.validAt, "validAt", { nullable: true }),
    knownAt: timestamp(input.knownAt, "knownAt"),
    ingestedAt: timestamp(input.ingestedAt, "ingestedAt"),
    expiresAt: timestamp(input.expiresAt, "expiresAt"),
    location: Object.freeze({
      locality: requiredString(input.location.locality, "location.locality"),
      jurisdiction: requiredString(input.location.jurisdiction, "location.jurisdiction"),
    }),
    confidence: input.confidence,
    verificationStatus: input.verificationStatus,
    license: normalizeLicense(input.license),
    evidenceStatus: input.evidenceStatus,
    evidenceRef: input.evidenceRef === null
      ? null
      : requiredString(input.evidenceRef, "evidenceRef"),
    correctionOf: input.correctionOf === null || input.correctionOf === undefined
      ? null
      : requiredString(input.correctionOf, "correctionOf"),
    retracts: input.retracts === null || input.retracts === undefined
      ? null
      : requiredString(input.retracts, "retracts"),
  };

  if (event.eventType === "smoke.observed") {
    event.publicMessage = "Observed smoke report. Source unverified; this does not confirm a fire, its origin, or current official warning status.";
  }

  return Object.freeze(event);
}

export function deduplicateSituationalAwarenessEvents(events) {
  const byId = new Map();
  for (const event of events) {
    const existing = byId.get(event.id);
    if (existing && !isDeepStrictEqual(existing, event)) {
      throw new TypeError(`conflicting situational-awareness events share id ${event.id}`);
    }
    if (!existing) byId.set(event.id, event);
  }
  return [...byId.values()];
}

export function assessFeedFreshness({
  state,
  checkedAt,
  lastSuccessfulAt,
  maxAgeMs,
}) {
  if (state === "unavailable") return Object.freeze({ status: "unavailable" });
  if (state !== "available") throw new TypeError("feed state must be available or unavailable");
  timestamp(checkedAt, "checkedAt");
  timestamp(lastSuccessfulAt, "lastSuccessfulAt");
  if (!Number.isFinite(maxAgeMs) || maxAgeMs < 0) {
    throw new TypeError("maxAgeMs must be a non-negative number");
  }

  const ageMs = Date.parse(checkedAt) - Date.parse(lastSuccessfulAt);
  if (ageMs < 0) {
    return Object.freeze({ status: "stale", reason: "source_timestamp_in_future" });
  }
  if (ageMs > maxAgeMs) {
    return Object.freeze({ status: "stale", ageMs });
  }
  return Object.freeze({ status: "fresh", ageMs });
}
