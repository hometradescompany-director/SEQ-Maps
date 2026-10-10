import test from "node:test";
import assert from "node:assert/strict";
import {
  GOOGLE_MAPS_CAPABILITIES,
  getGoogleMapsCapability,
  getGoogleMapsServiceIds,
} from "../src/adapters/google-maps/capabilities.mjs";

test("default provisioning set is deduplicated and excludes legacy-only services", () => {
  const services = getGoogleMapsServiceIds();
  assert.equal(services.length, new Set(services).size);
  assert.ok(services.includes("routes.googleapis.com"));
  assert.ok(services.includes("places.googleapis.com"));
  assert.ok(services.includes("weather.googleapis.com"));
  assert.ok(services.includes("mapstools.googleapis.com"));
  assert.ok(!services.includes("directions-backend.googleapis.com"));
  assert.ok(!services.includes("distance-matrix-backend.googleapis.com"));
});

test("legacy services are opt-in", () => {
  const services = getGoogleMapsServiceIds({ includeLegacy: true });
  assert.ok(services.includes("directions-backend.googleapis.com"));
  assert.ok(services.includes("distance-matrix-backend.googleapis.com"));
});

test("capability registry has unique capability ids and stable lookup", () => {
  const ids = GOOGLE_MAPS_CAPABILITIES.map(({ id }) => id);
  assert.equal(ids.length, new Set(ids).size);
  assert.equal(getGoogleMapsCapability("roads")?.serviceId, "roads.googleapis.com");
  assert.equal(getGoogleMapsCapability("does-not-exist"), null);
});
