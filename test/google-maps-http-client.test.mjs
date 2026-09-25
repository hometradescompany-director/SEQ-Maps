import test from "node:test";
import assert from "node:assert/strict";
import { createGoogleMapsHttpClient } from "../src/adapters/google-maps/http-client.mjs";

function jsonResponse(value) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

test("uses X-Goog-Api-Key for modern googleapis service hosts", async () => {
  let captured;
  const client = createGoogleMapsHttpClient({
    apiKey: "test-key",
    fetchImpl: async (url, options) => {
      captured = { url: String(url), headers: new Headers(options.headers) };
      return jsonResponse({ ok: true });
    },
  });

  await client.request("https://routes.googleapis.com/directions/v2:computeRoutes", { method: "POST" });
  assert.equal(captured.headers.get("X-Goog-Api-Key"), "test-key");
  assert.ok(!captured.url.includes("key="));
});

test("uses query-key authentication for maps.googleapis.com legacy web services", async () => {
  let captured;
  const client = createGoogleMapsHttpClient({
    apiKey: "test-key",
    fetchImpl: async (url) => {
      captured = String(url);
      return jsonResponse({ ok: true });
    },
  });

  await client.request("https://maps.googleapis.com/maps/api/geocode/json?address=Brisbane");
  assert.match(captured, /key=test-key/);
});

test("rejects non-Google API hosts", async () => {
  const client = createGoogleMapsHttpClient({ apiKey: "test-key", fetchImpl: async () => jsonResponse({}) });
  await assert.rejects(() => client.request("https://example.com/path"), /googleapis\\.com/);
});
