const LICENSE_STANDINGS = new Set(["declared", "missing", "unknown"]);

function requiredString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value;
}

function isoTimestamp(value, field) {
  requiredString(value, field);
  if (Number.isNaN(Date.parse(value))) {
    throw new TypeError(`${field} must be an ISO-compatible timestamp`);
  }
  return value;
}

function normalizeLicense(license) {
  if (!license || !LICENSE_STANDINGS.has(license.standing)) {
    throw new TypeError("license.standing must be declared, missing or unknown");
  }

  if (license.standing === "declared") {
    requiredString(license.id, "license.id");
  }

  return Object.freeze({
    standing: license.standing,
    ...(license.id ? { id: license.id } : {}),
  });
}

/**
 * Provider-neutral observation envelope at the adapter/core boundary.
 * Time fields are explicit by design: the function never aliases or
 * invents validAt, knownAt or ingestedAt.
 */
export function createObservationEnvelope(input) {
  if (!input || typeof input !== "object") {
    throw new TypeError("observation input is required");
  }

  return Object.freeze({
    id: requiredString(input.id, "id"),
    kind: requiredString(input.kind, "kind"),
    sourceRef: requiredString(input.sourceRef, "sourceRef"),
    subjectRef: requiredString(input.subjectRef, "subjectRef"),
    validAt: isoTimestamp(input.validAt, "validAt"),
    knownAt: isoTimestamp(input.knownAt, "knownAt"),
    ingestedAt: isoTimestamp(input.ingestedAt, "ingestedAt"),
    license: normalizeLicense(input.license),
    evidenceRef: input.evidenceRef
      ? requiredString(input.evidenceRef, "evidenceRef")
      : null,
    payload: input.payload ?? null,
  });
}
