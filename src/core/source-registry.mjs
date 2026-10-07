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

function optionalTimestamp(value, field) {
  if (value == null) return null;
  requiredString(value, field);
  if (Number.isNaN(Date.parse(value))) {
    throw new TypeError(`${field} must be an ISO-compatible timestamp`);
  }
  return value;
}

export function createSourceRecord(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("source input is required");
  }

  const authority = input.authority ?? "unverified";
  if (!Object.hasOwn(SOURCE_AUTHORITY_ORDER, authority)) {
    throw new TypeError("source authority is not recognized");
  }
  const standing = input.standing ?? "candidate";
  if (!SOURCE_STANDINGS.has(standing)) {
    throw new TypeError("source standing must be candidate, accepted or rejected");
  }
  const capabilities = input.capabilities ?? input.declaredCapabilities ?? [];
  if (!Array.isArray(capabilities)) {
    throw new TypeError("source capabilities must be an array");
  }

  return Object.freeze({
    id: requiredString(input.id, "source id"),
    name: requiredString(input.name, "source name"),
    publisher: requiredString(input.publisher, "source publisher"),
    kind: input.kind ?? "unknown",
    authority,
    jurisdiction: input.jurisdiction ?? null,
    canonicalUrl: requiredString(input.canonicalUrl, "source canonicalUrl"),
    endpoint: input.endpoint ?? null,
    protocol: input.protocol ?? null,
    format: input.format ?? null,
    licence: input.licence ?? null,
    termsUrl: input.termsUrl ?? null,
    capabilities: Object.freeze(capabilities.map((capability) => (
      requiredString(capability, "source capability")
    ))),
    standing,
    observedAt: optionalTimestamp(input.observedAt, "source observedAt"),
    expiresAt: optionalTimestamp(input.expiresAt, "source expiresAt"),
    reviewAt: optionalTimestamp(input.reviewAt, "source reviewAt"),
  });
}

export function sourceSupports(source, requiredAuthority = "supplementary") {
  return source?.standing === "accepted"
    && Object.hasOwn(SOURCE_AUTHORITY_ORDER, requiredAuthority)
    && Object.hasOwn(SOURCE_AUTHORITY_ORDER, source.authority)
    && SOURCE_AUTHORITY_ORDER[source.authority] >= SOURCE_AUTHORITY_ORDER[requiredAuthority];
}
