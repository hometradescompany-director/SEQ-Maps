# Situational awareness: smoke and bushfire

## Repository audit and scope

This is a bootstrap repository, not an existing public map application. The current proof spine is the provider-neutral observation envelope and source registry, the QLDTraffic event adapter, and corridor analytics. The source registry is descriptive; registration alone does not grant permission to call a service (`src/core/source-registry.mjs`, `docs/SOURCE_REGISTRY.md`).

| Capability | Existing implementation | Terms / status |
|---|---|---|
| Roadworks and other road incidents | QLDTraffic event subtype in `src/adapters/qldtraffic-events.mjs` | DTMR QLDTraffic; CC BY 4.0 is recorded in `THIRD_PARTY_DATA.md`; live API requires a key |
| Queensland spatial data | Candidate seed records in `data/sources/qld-seq-seed.json` | Portal records declare CC BY 4.0; no corresponding ingestion adapters in this repository |
| Fire, smoke, flood, air quality | No ingestion adapter or map layer | No feed terms, refresh schedule or live data access verified |
| Weather | Google Maps capability metadata only | No weather-data consumer or adapter |
| Council data | No council-specific source or connector | No council endpoint or permission selected |
| Map and public API | Google Maps HTTP/capability adapters and opt-in provisioning scripts | No application map UI or public API implementation |
| Provider selection | Generic source registry and provider seams | No federated capability-routing registry; Google is not enabled by these code changes |

The README's “provider-agnostic core,” “provenance by default,” and “proof before sprawl” principles remain the design constraints. Google Maps, OSM/MapLibre, council OGC services, and other lawful providers should coexist only through explicit, reversible adapters with their own terms and attribution. No provider owns identity, events, or evidence.

There is no Lovable reference or project in this checkout. Other workspaces are not accessible from this repository clone, so their project status is unknown; no new project is proposed.

## Event contract in this change

`src/core/situational-awareness-event.mjs` is a provider-neutral contract, not a feed adapter, persistence layer, or map UI. Event types remain explicit: `smoke.observed`, `fire.confirmed`, `burn.prescribed`, `plume.inferred`, `air_quality.observed`, `weather.wind.observed`, and `fire.warning.issued`. A human smoke report must remain unverified; official-feed smoke observations require official status, and derived smoke observations require corroborated status. Confirmed fires, warnings, and prescribed burns require an official source and status. Inferred plumes require a derived source. Correlation is left to a future projection and cannot rewrite source records.

Every event carries its source reference/type, original source timestamp text when known, distinct `validAt`, `knownAt`, and `ingestedAt` fields, expiry, coarse locality/jurisdiction, confidence, verification status, evidence status/reference, licence standing, and optional correction or retraction reference. Corrections and retractions are new records; exact replay of an event ID is idempotent, while conflicting reuse of an ID fails. No correction or retraction deletes the original.

The Tanah Merah fixture records only the issue's approximate report time and locality. It has no coordinates, street address, reporter identity, or supplied evidence link. Its time of occurrence is unknown, confidence is unassessed, and licence standing is unknown. Its public message says the source is unverified and does not confirm a fire, source, or official warning. The fixture is explicitly synthetic and is not a live incident.

Feed-health fixtures exercise `fresh`, `stale`, and `unavailable` states. No feeds are polled in this change; the sample feed records are synthetic and must never be presented as current agency data. The prototype status function requires callers to supply timestamps and a source-specific maximum age.

## Source, licence, privacy, and operational readiness

| Source / publisher | Intended role | Ownership, endpoint, terms, and current status |
|---|---|---|
| Queensland Fire Department current incidents | Official incidents, warnings, and public guidance | Public information page: <https://www.fire.qld.gov.au/Current-Incidents>. A machine-readable endpoint, API owner/contract, reuse terms, refresh cadence, and adapter have not been verified. Not ingested. |
| Queensland Government air-quality information | PM2.5 / smoke health context and public guidance | Public information page: <https://apps.des.qld.gov.au/air-quality/health/>. Dataset/API ownership, terms, refresh cadence, and adapter have not been verified. Not ingested. |
| Queensland bushfire safety guidance | Public safety guidance only | <https://www.qld.gov.au/emergency/dealing-disasters/disaster-types/bushfires>. A link is not an incident feed or evidence for an observation. |
| Queensland DTMR QLDTraffic | Road-event context | Existing registered source; see `THIRD_PARTY_DATA.md` and `docs/sources/QLDTRAFFIC_EVENTS.md`. Its road events remain distinct from fire/smoke observations. |
| Local council OGC/GIS/API services | Potential bounded local context | No council service has been selected or verified in this repository. Publisher, authority scope, terms, endpoint, and refresh must be recorded before use. |

The three Queensland guidance links above are for user direction only, not permission to copy or redistribute data. Fire and air-quality feeds remain candidates with unknown terms and must be treated as non-redistributable until verified. Source records must capture publisher, canonical URL, authority, licence/terms, attribution, redistribution and commercial-use restrictions, endpoint/protocol, capability, geography, refresh/expiry, cost/quotas, confidence, privacy scope, and fallback before an adapter is accepted.

There is no scheduled refresh or live feed availability guarantee in this repository. A future UI must show stale and unavailable status, last successful source time, and a link to the original source; it must not quietly substitute another provider's data. Locality-level placement is intentionally coarse and is not a verified fire location, plume footprint, or property-level risk. No coordinates are inferred from the report.

The public contract excludes reporter identity, private addresses, precise personal locations, and unconsented fleet/site data. A human report with unknown licence standing is not redistributable; an evidence link is shown only when supplied and permitted. Any future fleet/private-site connector must be opt-in, keep authorised data separate from public layers, and support withdrawal/revocation without erasing audit history. This repository currently has no authentication, consent, persistence, or public/authorised data separation implementation.

Failure modes include missing or delayed feeds, unknown/changed terms, invalid source timestamps, duplicate or conflicting identifiers, coarse or mistaken locations, conflicting providers, corrections, withdrawn reports, and provider quota/outage. The safe fallback is to mark the source stale/unavailable or unverified, preserve distinct source records, and link to official guidance. SEQ Maps must not issue autonomous emergency warnings, infer a fire from smoke alone, attribute a smoke source, perform surveillance, or imply government endorsement, funding, or approval.

## UX gap and proposed next slice

The owner-provided premium map-hub visual is a target, not repository evidence or verified data volume. This checkout has no central interactive map, layer controls, mobile layout, professional-service/property context, government/API discovery UI, site/fleet overlays, or Diamond evidence presentation. The present change supplies only the event contract and a public-message field; it does not claim to implement those UX surfaces.

Recommended next reviewable slice: a read-only, accessible Logan locality map/card for a fleet-operator scenario. Render the synthetic smoke report distinctly from an official-incident layer; show source, time, licence standing, confidence, expiry, the unverified message, official guidance links, and an explicit unavailable state for unconfigured feeds. Use mocked private fleet/site data in tests only. Select one published council GIS/API source only after its authority and terms are verified; do not collect private council data or enable billable APIs. Keep the map provider behind an adapter and preserve a reversible path for permitted Google, OSM/MapLibre, and OGC capabilities.

Proposed pilot acceptance measures (not approved targets or commitments):

1. In a usability check with at least five consenting fleet/council users, at least four can distinguish an unverified smoke report from an official incident and reach official guidance within one minute.
2. Every rendered event shows source, source time, licence standing, confidence/verification, and freshness; all synthetic stale/unavailable cases are visibly distinct.
3. All correction/retraction tests preserve the original record; exact replay is deduplicated and conflicting IDs are rejected.
4. The public scenario reveals no reporter identity, street address, precise coordinates, or private fleet/site data.
5. Record source refresh success, stale/unavailable duration, and user task completion. Compare against a documented baseline before claiming public benefit.

These measures are proposals for a bounded demonstration, not evidence of council endorsement, government funding, or operational emergency capability.
