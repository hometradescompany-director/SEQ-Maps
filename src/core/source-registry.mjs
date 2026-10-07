/** Provider/source registry. Descriptive only: registration does not imply permission to call. */
export const SOURCE_AUTHORITY_ORDER = Object.freeze({
  unverified: 0, supplementary: 1, official: 2, authoritative: 3, canonical: 4,
});

const SOURCE_STANDINGS = new Set(["candidate", "accepted", "suspended", "retired"]);
const LICENCE_STANDINGS = new Set(["declared", "unknown", "restricted"]);

function required(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${field} is required`);
  return value;
}

function freezeList(value) {
  return Object.freeze([...(value ?? [])].map(String));
}

export function createSourceRecord(input) {
  if (!input || typeof input !== "object") throw new TypeError("source input is required");
  required(input.id, "source id"); required(input.name, "source name");
  required(input.publisher, "publisher"); required(input.canonicalUrl, "canonicalUrl");
  const standing = input.standing ?? "candidate";
  if (!SOURCE_STANDINGS.has(standing)) throw new TypeError("invalid source standing");
  const licenceStanding = input.licenceStanding ?? (input.licence ? "declared" : "unknown");
  if (!LICENCE_STANDINGS.has(licenceStanding)) throw new TypeError("invalid licence standing");

  return Object.freeze({
    id: String(input.id), name: String(input.name), publisher: String(input.publisher),
    kind: input.kind ?? "unknown", authority: input.authority ?? "unverified",
    jurisdiction: input.jurisdiction ?? null, canonicalUrl: String(input.canonicalUrl),
    endpoint: input.endpoint ?? null, protocol: input.protocol ?? null,
    licence: input.licence ?? null, licenceStanding, termsUrl: input.termsUrl ?? null,
    attribution: input.attribution ?? null,
    capabilities: freezeList(input.capabilities),
    formats: freezeList(input.formats),
    updateFrequency: input.updateFrequency ?? null,
    securityClassification: input.securityClassification ?? null,
    usedInDataDrivenApplication: input.usedInDataDrivenApplication ?? null,
    standing, observedAt: input.observedAt ?? null, sourceUpdatedAt: input.sourceUpdatedAt ?? null,
    expiresAt: input.expiresAt ?? null,
  });
}

export function sourceSupports(source, requiredAuthority = "supplementary") {
  return source?.standing === "accepted"
    && source?.licenceStanding !== "unknown"
    && (SOURCE_AUTHORITY_ORDER[source.authority] ?? 0) >= (SOURCE_AUTHORITY_ORDER[requiredAuthority] ?? 0);
}

export function sourceCanBeQueried(source) {
  return sourceSupports(source) && Boolean(source.endpoint) && Boolean(source.protocol);
}
