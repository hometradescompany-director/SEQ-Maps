function required(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`${field} is required`);
  return value;
}
const freeze = value => Object.freeze([...(value ?? [])].map(String));

/**
 * One substrate, many role projections. A hub describes a professional role/service;
 * it does not assert that a person holds a qualification or grant execution authority.
 */
export function createProfessionalHub(input) {
  if (!input || typeof input !== "object") throw new TypeError("professional hub input is required");
  return Object.freeze({
    id: required(input.id, "id"),
    role: required(input.role, "role"),
    profession: required(input.profession, "profession"),
    jurisdiction: required(input.jurisdiction, "jurisdiction"),
    regulatorRefs: freeze(input.regulatorRefs),
    qualificationRefs: freeze(input.qualificationRefs),
    registrationRefs: freeze(input.registrationRefs),
    capabilities: freeze(input.capabilities),
    serviceClasses: freeze(input.serviceClasses),
    sourceRefs: freeze(input.sourceRefs),
    relationshipTypes: freeze(input.relationshipTypes),
    availability: input.availability ?? null,
    contactChannels: Object.freeze({ ...(input.contactChannels ?? {}) }),
    standing: input.standing ?? "candidate",
    observedAt: input.observedAt ?? null,
  });
}

export function hubIsDiscoverable(hub) {
  return hub?.standing === "accepted" && hub.sourceRefs?.length > 0;
}
