const TERMS_STANDINGS = new Set(["declared", "missing", "unknown"]);

function requiredString(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function stringList(value, field) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim().length === 0)) {
    throw new TypeError(`${field} must be an array of non-empty strings`);
  }
  return value.map((item) => item.trim());
}

function timestamp(value, field) {
  const result = requiredString(value, field);
  if (!Number.isFinite(Date.parse(result))) throw new TypeError(`${field} must be a valid date or timestamp`);
  return result;
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export function createProfessionalHub(input) {
  if (!input || typeof input !== "object") throw new TypeError("hub input is required");
  if (!input.identity || typeof input.identity !== "object") {
    throw new TypeError("identity is required");
  }
  if (!input.terms || !TERMS_STANDINGS.has(input.terms.standing)) {
    throw new TypeError("terms.standing must be declared, missing or unknown");
  }
  if (input.terms.standing === "declared") requiredString(input.terms.id, "terms.id");
  if (!input.freshness || typeof input.freshness !== "object") {
    throw new TypeError("freshness is required");
  }
  const sourceEvidence = stringList(input.sourceEvidence, "sourceEvidence");
  if (sourceEvidence.length === 0) throw new TypeError("sourceEvidence must contain at least one reference");

  return deepFreeze({
    identity: {
      id: requiredString(input.identity.id, "identity.id"),
      name: requiredString(input.identity.name, "identity.name"),
    },
    role: requiredString(input.role, "role"),
    profession: requiredString(input.profession, "profession"),
    jurisdiction: requiredString(input.jurisdiction, "jurisdiction"),
    registrationReferences: stringList(input.registrationReferences ?? [], "registrationReferences"),
    capabilities: stringList(input.capabilities ?? [], "capabilities"),
    serviceArea: input.serviceArea ?? null,
    contactChannels: input.contactChannels ?? [],
    sourceEvidence,
    authority: requiredString(input.authority, "authority"),
    executionAuthority: null,
    terms: {
      standing: input.terms.standing,
      ...(input.terms.id ? { id: requiredString(input.terms.id, "terms.id") } : {}),
      ...(input.terms.url ? { url: requiredString(input.terms.url, "terms.url") } : {}),
    },
    freshness: {
      observedAt: timestamp(input.freshness.observedAt, "freshness.observedAt"),
      reviewAt: timestamp(input.freshness.reviewAt, "freshness.reviewAt"),
    },
    availability: input.availability ?? null,
    relationships: input.relationships ?? [],
  });
}
