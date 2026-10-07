function requiredString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value;
}

function freezeArray(values, field) {
  if (!Array.isArray(values)) throw new TypeError(`${field} must be an array`);
  return Object.freeze(values.map((value) => {
    if (typeof value === "string") return requiredString(value, field);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError(`${field} entries must be strings or objects`);
    }
    return Object.freeze({ ...value });
  }));
}

/**
 * Create a sourced professional entity; this is descriptive and does not
 * imply endorsement, current registration, or permission to contact.
 */
export function createProfessionalEntity(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("professional entity input is required");
  }
  if (!input.identity || typeof input.identity !== "object" || Array.isArray(input.identity)) {
    throw new TypeError("professional entity identity is required");
  }

  const evidence = freezeArray(input.sourceEvidence, "sourceEvidence");
  if (evidence.length === 0 || evidence.some((item) => (
    typeof item === "string" || typeof item.sourceRef !== "string" || item.sourceRef.trim() === ""
  ))) {
    throw new TypeError("sourceEvidence must include at least one sourceRef record");
  }

  const profession = requiredString(input.profession, "profession");
  const roles = freezeArray(input.roles ?? [profession], "roles");
  if (roles.length === 0 || roles.some((role) => typeof role !== "string")) {
    throw new TypeError("roles must include at least one professional role");
  }

  return Object.freeze({
    id: requiredString(input.id, "id"),
    identity: Object.freeze({
      ...input.identity,
      name: requiredString(input.identity.name, "identity.name"),
    }),
    profession,
    roles,
    jurisdiction: requiredString(input.jurisdiction, "jurisdiction"),
    registrationRefs: freezeArray(input.registrationRefs ?? [], "registrationRefs"),
    capabilities: freezeArray(input.capabilities ?? [], "capabilities"),
    serviceArea: input.serviceArea ?? null,
    contactChannels: freezeArray(input.contactChannels ?? [], "contactChannels"),
    sourceEvidence: evidence,
    authority: input.authority ?? null,
    licence: input.licence ?? null,
    termsUrl: input.termsUrl ?? null,
    freshness: input.freshness ?? null,
    availability: input.availability ?? null,
    relationships: freezeArray(input.relationships ?? [], "relationships"),
  });
}

/** Project a shared entity into a selected professional role without copying a directory record. */
export function projectProfessionalRole(entity, profession = entity?.profession) {
  if (!entity || typeof entity !== "object") {
    throw new TypeError("professional entity is required");
  }
  const selectedProfession = requiredString(profession, "profession");
  if (!entity.roles?.includes(selectedProfession)) {
    throw new TypeError("profession must be listed in the entity roles");
  }
  return Object.freeze({
    ...entity,
    profession: selectedProfession,
  });
}
