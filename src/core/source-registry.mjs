/** Provider/source registry. Descriptive only: registration does not imply permission to call. */
export const SOURCE_AUTHORITY_ORDER = Object.freeze({
  unverified: 0, supplementary: 1, official: 2, authoritative: 3, canonical: 4,
});

export function createSourceRecord(input) {
  if (!input || typeof input !== "object") throw new TypeError("source input is required");
  if (!input.id || !input.name || !input.publisher || !input.canonicalUrl) {
    throw new TypeError("source id, name, publisher and canonicalUrl are required");
  }
  return Object.freeze({
    id: String(input.id), name: String(input.name), publisher: String(input.publisher),
    kind: input.kind ?? "unknown", authority: input.authority ?? "unverified",
    jurisdiction: input.jurisdiction ?? null, canonicalUrl: String(input.canonicalUrl),
    endpoint: input.endpoint ?? null, protocol: input.protocol ?? null,
    licence: input.licence ?? null, termsUrl: input.termsUrl ?? null,
    capabilities: Object.freeze([...(input.capabilities ?? [])]),
    standing: input.standing ?? "candidate", observedAt: input.observedAt ?? null,
    expiresAt: input.expiresAt ?? null,
  });
}

export function sourceSupports(source, requiredAuthority = "supplementary") {
  return source?.standing === "accepted"
    && (SOURCE_AUTHORITY_ORDER[source.authority] ?? 0) >= (SOURCE_AUTHORITY_ORDER[requiredAuthority] ?? 0);
}
