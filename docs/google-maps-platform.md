# Google Maps Platform provider integration

Google Maps Platform is an external provider behind the SEQ Maps adapter boundary. Provider payloads do not become core state directly. They must be normalized into the existing observation and event model with source, time and licence standing preserved.

## What this integration owns

It owns provider capability metadata, HTTP authentication mechanics, and a repeatable Google Cloud service-enablement plan. It does not own Google source truth, credentials, billing configuration, or transport-domain identity.

## Service provisioning

Set the target Google Cloud project and inspect the plan first:

```bash
export GOOGLE_CLOUD_PROJECT="your-project-id"
npm run gcp:maps:plan
```

Apply the current non-legacy service set only after authenticating `gcloud` to the intended Google account and project:

```bash
gcloud auth login
npm run gcp:maps:enable
```

Google still lists Directions API and Distance Matrix API as legacy core services. They are intentionally opt-in:

```bash
node scripts/gcp/enable-google-maps-platform.mjs --apply --include-legacy
```

The service registry includes the current Maps, Routes, Places and Environment service IDs from Google's setup documentation, plus explicit current entries for Places API (New) and Maps Grounding Lite.

## Credentials

Do not commit API keys. Use separate keys by execution surface and restrict each key to the minimum APIs and application boundary that needs it.

- backend/server key: restrict by server IP or the deployment control available for the runtime;
- browser key: restrict by HTTP referrer;
- Android/iOS keys: create only when those clients exist and restrict by package/bundle identity.

The repository currently provides `GOOGLE_MAPS_SERVER_API_KEY` and `GOOGLE_MAPS_BROWSER_API_KEY` placeholders only. Credential creation stays a deployment action because the correct restriction depends on the final runtime.

## Runtime adapter

`createGoogleMapsHttpClient()` accepts only `googleapis.com` hosts. Modern service hosts receive the key through `X-Goog-Api-Key`; the shared `maps.googleapis.com` web-service host receives it as the `key` query parameter.

Domain-specific adapters should call this client and then normalize provider responses into SEQ Maps domain observations. Do not expose raw provider payloads as the source of truth.
