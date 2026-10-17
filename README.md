# SEQ Maps

Local-first mapping and traffic intelligence for Southeast Queensland.

SEQ Maps turns permitted public and local transport observations into auditable traffic context. The first objective is deliberately narrow: prove one complete path from source observation to useful local map intelligence, with provenance preserved end to end.

## Principles

- **Local relevance first.** Prefer evidence that improves decisions for the place actually being served.
- **Events over snapshots.** Preserve what changed, when it changed, and where the observation came from.
- **Provider-agnostic core.** Mapping, routing and data providers are adapters, not the product.
- **Provenance by default.** Every external observation carries source, time and licence standing.
- **No silent copying.** Shared capabilities are consumed through explicit contracts rather than duplicated.
- **Proof before sprawl.** One measurable vertical slice earns the next.

## First proof spine

```text
source
  -> observation
  -> normalization
  -> place / road-segment identity
  -> traffic event
  -> evidence
  -> local context projection
  -> API
  -> map surface
  -> measurable proof
```

The first deployment target will be a bounded Southeast Queensland corridor selected for measurable usefulness, not maximum feature count.

## Situational awareness

The smoke/bushfire event contract and its source, licensing, privacy, and pilot boundaries are documented in [Situational awareness](docs/SITUATIONAL_AWARENESS.md). No live fire, air-quality, weather, or council feed is enabled.

## Repository status

Bootstrap stage. Architecture and contracts come before UI.

## Executable boundary

The current engine is a set of Node.js modules, not a running service. It can validate observation envelopes, normalize a supplied QLDTraffic event, assess freshness and licence attribution for a live-projection decision, and calculate descriptive corridor metrics. The live-observation gate returns an eligibility result; it does not ingest, persist, or continuously evaluate observations.

Run the built-in tests with `npm test` (Node.js 22 or newer). CI runs this command on pull requests and pushes to `main`. To focus on the observation boundary, run:

```sh
node --test test/live-observation-gate.test.mjs test/observation-envelope.test.mjs test/observation-freshness.test.mjs test/qldtraffic-events.test.mjs
```

These tests use synthetic fixtures and stubbed requests. There is no configured live-feed poller or end-to-end live-source-to-map pipeline; source discovery or registration alone does not grant permission to fetch or redistribute data.

## Licence

Software in this repository is licensed under the Apache License 2.0 unless a file states otherwise.

External datasets, APIs and source material retain their own licences and terms. See `THIRD_PARTY_DATA.md`.

## Engineering doctrine

For the shared **POS Systems / “Welcome to the Shit Show”** engineering posture and its application in this repository, see [README.POS.md](README.POS.md).
