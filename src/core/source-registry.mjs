/** Provider/source registry. Descriptive only: registration does not imply permission to call. */
export const SOURCE_AUTHORITY_ORDER = Object.freeze({
  unverified: 0, supplementary: 1, official: 2, authoritative: 3, canonical: 4,
});

const SOURCE_STANDINGS = new Set(["candidate", "accepted", "blocked"]);

export function createSourceRecord(input) {
  if (!input || typeof input !== "object") throw new TypeError("source input is required");
  if (!input.id || !input.name || !input.publisher || !input.canonicalUrl) {
    throw new TypeError("source id, name, publisher and canonicalUrl are required");
  }
  if (input.standing !== undefined && !SOURCE_STANDINGS.has(input.standing)) {
    throw new TypeError("source standing must be candidate, accepted or blocked");
  }
  if (input.standing === "accepted") {
    for (const field of ["jurisdiction", "endpoint", "protocol", "licence", "termsUrl", "observedAt", "reviewAt"]) {
      if (typeof input[field] !== "string" || input[field].trim().length === 0) {
        throw new TypeError(`accepted source ${field} must be a non-empty string`);
      }
    }
    if ((SOURCE_AUTHORITY_ORDER[input.authority] ?? 0) < SOURCE_AUTHORITY_ORDER.official) {
      throw new TypeError("accepted sources require verified official authority");
    }
  }
  return Object.freeze({
    id: String(input.id), name: String(input.name), publisher: String(input.publisher),
    kind: input.kind ?? "unknown", authority: input.authority ?? "unverified",
    jurisdiction: input.jurisdiction ?? null, canonicalUrl: String(input.canonicalUrl),
    endpoint: input.endpoint ?? null, protocol: input.protocol ?? null,
    licence: input.licence ?? null, termsUrl: input.termsUrl ?? null,
    capabilities: Object.freeze([...(input.capabilities ?? [])]),
    standing: input.standing ?? "candidate", observedAt: input.observedAt ?? null,
    reviewAt: input.reviewAt ?? null, expiresAt: input.expiresAt ?? null,
    attribution: input.attribution ?? null,
    redistribution: input.redistribution ?? null,
    commercialUse: input.commercialUse ?? null,
  });
}

export function sourceSupports(source, requiredAuthority = "supplementary") {
  const minimumAuthority = SOURCE_AUTHORITY_ORDER[requiredAuthority];
  return source?.standing === "accepted"
    && minimumAuthority !== undefined
    && SOURCE_AUTHORITY_ORDER[source.authority] !== undefined
    && SOURCE_AUTHORITY_ORDER[source.authority] >= minimumAuthority;
}
