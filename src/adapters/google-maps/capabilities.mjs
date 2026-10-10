const rawCapabilities = [
  ["address-validation", "places", "addressvalidation.googleapis.com", "ga", true],
  ["places-aggregate", "places", "areainsights.googleapis.com", "ga", true],
  ["map-tiles", "maps", "tile.googleapis.com", "ga", true],
  ["aerial-view", "maps", "aerialview.googleapis.com", "ga", true],
  ["elevation", "maps", "elevation-backend.googleapis.com", "ga", true],
  ["routes", "routes", "routes.googleapis.com", "ga", true],
  ["geocoding", "places", "geocoding-backend.googleapis.com", "ga", true],
  ["geolocation", "places", "geolocation.googleapis.com", "ga", true],
  ["maps-sdk-android", "maps", "maps-android-backend.googleapis.com", "ga", true],
  ["maps-javascript", "maps", "maps-backend.googleapis.com", "ga", true],
  ["maps-embed", "maps", "maps-embed-backend.googleapis.com", "ga", true],
  ["maps-sdk-ios", "maps", "maps-ios-backend.googleapis.com", "ga", true],
  ["maps-datasets", "maps", "mapsplatformdatasets.googleapis.com", "ga", true],
  ["places-legacy", "places", "places-backend.googleapis.com", "ga-compat", true],
  ["roads", "routes", "roads.googleapis.com", "ga", true],
  ["route-optimization", "routes", "routeoptimization.googleapis.com", "ga", true],
  ["maps-static", "maps", "static-maps-backend.googleapis.com", "ga", true],
  ["street-view-static", "maps", "street-view-image-backend.googleapis.com", "ga", true],
  ["time-zone", "places", "timezone-backend.googleapis.com", "ga", true],
  ["air-quality", "environment", "airquality.googleapis.com", "ga", true],
  ["solar", "environment", "solar.googleapis.com", "ga", true],
  ["pollen", "environment", "pollen.googleapis.com", "ga", true],
  ["weather", "environment", "weather.googleapis.com", "ga", true],
  ["places-new", "places", "places.googleapis.com", "ga", true],
  ["maps-grounding-lite", "maps", "mapstools.googleapis.com", "ga", true],
  ["directions-legacy", "routes", "directions-backend.googleapis.com", "legacy", false],
  ["distance-matrix-legacy", "routes", "distance-matrix-backend.googleapis.com", "legacy", false],
];

export const GOOGLE_MAPS_CAPABILITIES = Object.freeze(
  rawCapabilities.map(([id, family, serviceId, stage, defaultEnabled]) => Object.freeze({
    id,
    family,
    serviceId,
    stage,
    defaultEnabled,
  }))
);

export function getGoogleMapsServiceIds({ includeLegacy = false } = {}) {
  const selected = GOOGLE_MAPS_CAPABILITIES.filter((capability) =>
    capability.defaultEnabled || (includeLegacy && capability.stage === "legacy")
  );

  return Object.freeze([...new Set(selected.map(({ serviceId }) => serviceId))]);
}

export function getGoogleMapsCapability(id) {
  return GOOGLE_MAPS_CAPABILITIES.find((capability) => capability.id === id) ?? null;
}
