import { createAssetContext } from "./fleet-asset-context.mjs";

/**
 * Project authorized source coordinates into a map-ready GeoJSON FeatureCollection.
 * Coordinates are supplied by the adapter; this module does not geocode or infer
 * asset/property locations. Missing or invalid geometry is retained as an absence.
 */
export function projectFleetMapLayer(records) {
  if (!Array.isArray(records)) throw new TypeError("records must be an array");
  const features = [];
  const omissions = [];
  for (const record of records) {
    const context = createAssetContext(record);
    const coordinates = record.coordinates;
    if (!Array.isArray(coordinates) || coordinates.length !== 2 ||
        !coordinates.every(Number.isFinite) ||
        coordinates[0] < -180 || coordinates[0] > 180 ||
        coordinates[1] < -90 || coordinates[1] > 90) {
      omissions.push(Object.freeze({ assetRef: context.assetRef, reason: "geometry_unavailable" }));
      continue;
    }
    features.push({
      type: "Feature",
      id: context.assetRef,
      geometry: { type: "Point", coordinates: [...coordinates] },
      properties: {
        assetRef: context.assetRef,
        assetClass: context.assetClass,
        segmentRef: context.segmentRef,
        propertyRef: context.propertyRef,
        sourceRef: context.observation.sourceRef,
        licenseId: context.observation.license.id,
        evidenceRef: context.observation.evidenceRef,
        validAt: context.observation.validAt,
        knownAt: context.observation.knownAt,
        ingestedAt: context.observation.ingestedAt,
        accessStanding: context.accessStanding,
        routeStanding: context.routeStanding
      }
    });
  }
  return Object.freeze({
    type: "FeatureCollection",
    features,
    metadata: { schema: "seq.maps.fleet.geojson/v1", accepted: features.length, omitted: omissions.length, omissions }
  });
}
