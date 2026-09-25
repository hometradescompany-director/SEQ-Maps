const GOOGLE_API_HOST = /(^|\\.)googleapis\\.com$/;

function requiredString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value;
}

function assertGoogleMapsUrl(value) {
  const url = new URL(requiredString(value, "url"));
  if (!GOOGLE_API_HOST.test(url.hostname)) {
    throw new TypeError("url must target a googleapis.com host");
  }
  return url;
}

export function createGoogleMapsHttpClient({ apiKey, fetchImpl = globalThis.fetch } = {}) {
  requiredString(apiKey, "apiKey");
  if (typeof fetchImpl !== "function") {
    throw new TypeError("fetchImpl must be a function");
  }

  return Object.freeze({
    async request(urlValue, options = {}) {
      const url = assertGoogleMapsUrl(urlValue);
      const headers = new Headers(options.headers ?? {});

      if (url.hostname === "maps.googleapis.com") {
        url.searchParams.set("key", apiKey);
      } else {
        headers.set("X-Goog-Api-Key", apiKey);
      }

      const response = await fetchImpl(url, { ...options, headers });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Google Maps API request failed (${response.status}): ${body.slice(0, 500)}`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      return contentType.includes("application/json") ? response.json() : response.text();
    },
  });
}
