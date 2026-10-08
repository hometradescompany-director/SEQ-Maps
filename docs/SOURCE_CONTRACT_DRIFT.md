# Source contract drift

External civic GIS services are live dependencies, not static files. SEQ Maps therefore treats a provider's published interface as an observed contract that can change independently of this repository.

`src/core/source-contract-drift.mjs` compares two observations of a source contract and emits typed drift without mutating either observation.

## Current drift classes

- coordinate reference system changes: breaking;
- endpoint or protocol changes: breaking;
- removal of a supported query format: breaking;
- additive query formats: compatible;
- licence changes: review required.

ArcGIS WKID `102100` is normalized to `EPSG:3857` so equivalent Web Mercator identifiers do not manufacture drift.

## Queensland 2026 trigger

Queensland's Administrative Boundaries MapServer published a user notice effective 26 June 2026 stating that the service moved from GDA94 geographic coordinates (EPSG:4283) to Web Mercator (EPSG:3857). The notice explicitly warns that existing applications, scripts, APIs and ETL workflows assuming geographic coordinates may require changes.

That is the canonical first regression for this capability: an authoritative source can remain authoritative while its technical contract changes enough to invalidate downstream assumptions.

## Boundary

Drift detection is descriptive evidence. It does not grant permission, change authority standing, rewrite source observations, or automatically repair consumers. A breaking or review-class change should block silent promotion until the affected adapter or projection is revalidated.
