const NORMALIZED_CRS = Object.freeze({
  "102100": "EPSG:3857",
  "3857": "EPSG:3857",
  "4283": "EPSG:4283",
  "4326": "EPSG:4326",
});

function crs(value) {
  if (value == null) return null;
  const raw = String(value).trim().toUpperCase().replace(/^EPSG:/, "");
  return NORMALIZED_CRS[raw] ?? `EPSG:${raw}`;
}

function sorted(values = []) {
  return [...new Set(values.map(String))].sort();
}

/**
 * Compare two observations of an external source contract.
 * Descriptive only: drift is evidence for review, never authority to mutate upstream data.
 */
export function detectSourceContractDrift(previous, current) {
  if (!previous || !current) throw new TypeError("previous and current source contracts are required");

  const changes = [];
  const beforeCrs = crs(previous.crs);
  const afterCrs = crs(current.crs);
  if (beforeCrs !== afterCrs) changes.push(Object.freeze({field:"crs", before:beforeCrs, after:afterCrs, severity:"breaking"}));

  for (const field of ["endpoint", "protocol", "licence"]) {
    const before = previous[field] ?? null;
    const after = current[field] ?? null;
    if (before !== after) changes.push(Object.freeze({field, before, after, severity: field === "endpoint" || field === "protocol" ? "breaking" : "review"}));
  }

  const beforeFormats = sorted(previous.queryFormats);
  const afterFormats = sorted(current.queryFormats);
  if (JSON.stringify(beforeFormats) !== JSON.stringify(afterFormats)) {
    const removed = beforeFormats.filter(value => !afterFormats.includes(value));
    changes.push(Object.freeze({field:"queryFormats", before:beforeFormats, after:afterFormats, removed:Object.freeze(removed), severity:removed.length ? "breaking" : "compatible"}));
  }

  return Object.freeze({
    sourceId: current.sourceId ?? previous.sourceId ?? null,
    changed: changes.length > 0,
    requiresReview: changes.some(change => change.severity === "breaking" || change.severity === "review"),
    changes: Object.freeze(changes),
  });
}
