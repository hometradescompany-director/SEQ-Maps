import { createObservationEnvelope } from "./observation-envelope.mjs";

/** Context is advisory. It does not establish property title, work orders, access rights or routing authority. */
export function createAssetContext(input) {
  if (!input || typeof input !== "object") throw new TypeError("asset context required");
  const observation = createObservationEnvelope(input.observation);
  if (!["declared"].includes(observation.license.standing)) throw new Error("asset_source_licence_not_declared");
  if (typeof input.assetRef !== "string" || !input.assetRef.trim()) throw new TypeError("assetRef required");
  if (typeof input.segmentRef !== "string" || !input.segmentRef.trim()) throw new TypeError("segmentRef required");
  if (!["road", "drainage", "water", "vegetation", "streetlight", "other"].includes(input.assetClass)) throw new TypeError("unsupported_asset_class");
  return Object.freeze({
    schema: "seq.maps.fleet.asset-context/v1",
    assetRef: input.assetRef,
    assetClass: input.assetClass,
    segmentRef: input.segmentRef,
    observation,
    propertyRef: typeof input.propertyRef === "string" && input.propertyRef.trim() ? input.propertyRef : null,
    accessStanding: "not-established",
    routeStanding: "not-established"
  });
}

/** Never transform missing evidence into a numerical priority or a legal permission. */
export function projectFleetAssetSummary(contexts, segmentRef) {
  if (typeof segmentRef !== "string" || !segmentRef.trim()) throw new TypeError("segmentRef required");
  const matches = contexts.filter(x => x.segmentRef === segmentRef);
  return Object.freeze({
    schema: "seq.maps.fleet.segment-summary/v1",
    segmentRef,
    assetCount: matches.length,
    assetRefs: Object.freeze([...new Set(matches.map(x => x.assetRef))].sort()),
    evidenceRefs: Object.freeze([...new Set(matches.map(x => x.observation.evidenceRef).filter(Boolean))].sort()),
    lastKnownAt: matches.length ? matches.map(x => x.observation.knownAt).sort().at(-1) : null,
    accessStanding: "not-established",
    routeStanding: "not-established"
  });
}
