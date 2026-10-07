/** Provider/source registry. Descriptive only: registration does not imply permission to call. */
export const SOURCE_AUTHORITY_ORDER = Object.freeze({
  unverified: 0, supplementary: 1, official: 2, authoritative: 3, canonical: 4,
});

const SOURCE_STANDINGS = new Set(["candidate", "accepted", "rejected"]);

function requiredString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value;
}

function optionalString(value, field) {
  return value == null ? null : requiredString(value, field);
}

function url(value, field) {
  const result = requiredString(value, field);
  let parsed;
  try {
    parsed = new URL(result);
  } catch {
    throw new TypeError(`${field} must be an absolute HTTP(S) URL`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new TypeError(`${field} must be an absolute HTTP(S) URL`);
  }
  return result;
}

function optionalTimestamp(value, field) {
  const timestamp = optionalString(value, field);
  if (timestamp !== null && Number.isNaN(Date.parse(timestamp))) {
    throw new TypeError(`${field} must be an ISO-compatible timestamp`);
  }
  return timestamp;
}

function stringList(value, field) {
  if (value == null) return Object.freeze([]);
  if (!Array.isArray(value)) throw new TypeError(`${field} must be an array`);
  return Object.freeze(value.map((item, index) => requiredString(item, `${field}[${index}]`)));
}

export function createSourceRecord(input) {
  if (!input || typeof input !== "object") throw new TypeError("source input is required");
  const id = requiredString(input.id, "id");
  const name = requiredString(input.name, "name");
  const publisher = requiredString(input.publisher, "publisher");
  const authority = input.authority ?? "unverified";
  if (!Object.hasOwn(SOURCE_AUTHORITY_ORDER, authority)) {
    throw new TypeError("source authority is not recognized");
  }
  const standing = input.standing ?? "candidate";
  if (!SOURCE_STANDINGS.has(standing)) {
    throw new TypeError("source standing must be candidate, accepted or rejected");
  }
  return Object.freeze({
    id, name, publisher,
    kind: optionalString(input.kind, "kind") ?? "unknown", authority,
    jurisdiction: optionalString(input.jurisdiction, "jurisdiction"),
    canonicalUrl: url(input.canonicalUrl, "canonicalUrl"),
    endpoint: input.endpoint == null ? null : url(input.endpoint, "endpoint"),
    protocol: optionalString(input.protocol, "protocol"),
    format: optionalString(input.format, "format"),
    licence: optionalString(input.licence, "licence"),
    termsUrl: input.termsUrl == null ? null : url(input.termsUrl, "termsUrl"),
    capabilities: stringList(input.capabilities, "capabilities"),
    standing, observedAt: optionalTimestamp(input.observedAt, "observedAt"),
    expiresAt: optionalTimestamp(input.expiresAt, "expiresAt"),
    reviewAt: optionalTimestamp(input.reviewAt, "reviewAt"),
  });
}

export function sourceSupports(source, requiredAuthority = "supplementary") {
  return source?.standing === "accepted"
    && Object.hasOwn(SOURCE_AUTHORITY_ORDER, requiredAuthority)
    && Object.hasOwn(SOURCE_AUTHORITY_ORDER, source.authority)
    && (SOURCE_AUTHORITY_ORDER[source.authority] ?? 0) >= (SOURCE_AUTHORITY_ORDER[requiredAuthority] ?? 0);
}
