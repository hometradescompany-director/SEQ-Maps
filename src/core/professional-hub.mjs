function requiredString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value;
}

function stringList(value, field) {
  if (value == null) return Object.freeze([]);
  if (!Array.isArray(value)) throw new TypeError(`${field} must be an array`);
  return Object.freeze(value.map((item, index) => requiredString(item, `${field}[${index}]`)));
}

function optionalTimestamp(value, field) {
  if (value == null) return null;
  const timestamp = requiredString(value, field);
  if (Number.isNaN(Date.parse(timestamp))) {
    throw new TypeError(`${field} must be an ISO-compatible timestamp`);
  }
  return timestamp;
}

function optionalUrl(value, field) {
  if (value == null) return null;
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

function referenceList(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError(`${field} must contain at least one source reference`);
  }
  return Object.freeze(value.map((reference, index) => {
    if (!reference || typeof reference !== "object") {
      throw new TypeError(`${field}[${index}] must be an object`);
    }
    const result = {
      sourceRef: requiredString(reference.sourceRef, `${field}[${index}].sourceRef`),
      evidenceRef: requiredString(reference.evidenceRef, `${field}[${index}].evidenceRef`),
    };
    const observedAt = optionalTimestamp(reference.observedAt, `${field}[${index}].observedAt`);
    if (observedAt !== null) result.observedAt = observedAt;
    return Object.freeze(result);
  }));
}

function contactList(value) {
  if (value == null) return Object.freeze([]);
  if (!Array.isArray(value)) throw new TypeError("contactChannels must be an array");
  return Object.freeze(value.map((channel, index) => {
    if (!channel || typeof channel !== "object") {
      throw new TypeError(`contactChannels[${index}] must be an object`);
    }
    return Object.freeze({
      type: requiredString(channel.type, `contactChannels[${index}].type`),
      value: requiredString(channel.value, `contactChannels[${index}].value`),
    });
  }));
}

export function createProfessionalEntity(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("professional entity input is required");
  }
  if (!input.identity || typeof input.identity !== "object" || Array.isArray(input.identity)) {
    throw new TypeError("identity is required");
  }
  return Object.freeze({
    id: requiredString(input.id, "id"),
    identity: Object.freeze({
      name: requiredString(input.identity.name, "identity.name"),
      externalId: input.identity.externalId == null
        ? null
        : requiredString(input.identity.externalId, "identity.externalId"),
    }),
    profession: requiredString(input.profession, "profession"),
    jurisdiction: requiredString(input.jurisdiction, "jurisdiction"),
    registrationRefs: stringList(input.registrationRefs, "registrationRefs"),
    qualificationRefs: stringList(input.qualificationRefs, "qualificationRefs"),
    capabilities: stringList(input.capabilities, "capabilities"),
    serviceArea: stringList(input.serviceArea, "serviceArea"),
    contactChannels: contactList(input.contactChannels),
    sourceEvidence: referenceList(input.sourceEvidence, "sourceEvidence"),
    regulatorRef: input.regulatorRef == null
      ? null
      : requiredString(input.regulatorRef, "regulatorRef"),
    licence: input.licence == null ? null : requiredString(input.licence, "licence"),
    termsUrl: optionalUrl(input.termsUrl, "termsUrl"),
    observedAt: optionalTimestamp(input.observedAt, "observedAt"),
    reviewAt: optionalTimestamp(input.reviewAt, "reviewAt"),
    availability: input.availability == null
      ? null
      : requiredString(input.availability, "availability"),
    relationships: stringList(input.relationships, "relationships"),
  });
}
