# SEQ Maps: Council and state fleet proof

## Commercial thesis
A field vehicle does not only need directions. Crews need permitted, up-to-date context about road segments, infrastructure assets, nearby property references, maintenance restrictions and observation provenance. The first demo should answer: **what assets are on this corridor, what evidence supports their location and condition, and what is still unknown?**

## Bounded demonstration
1. Select one Southeast Queensland corridor with a permitted road/transport feed and one permitted council asset dataset.
2. Register both publishers, endpoint versions, licensing and observation time in the source registry. Candidate sources cannot be silently promoted to accepted.
3. Normalize observations with distinct validAt, knownAt and ingestedAt.
4. Project opaque asset references onto road segments and show a map layer with clickable evidence, stale/unknown status and an explicit absence state.
5. Demonstrate a council field-crew workflow: locate an asset, inspect its provenance, compare traffic context, and open the original publisher reference.
6. Measure useful coverage, evidence freshness, false associations, retrieval latency and time saved versus the existing manual process.

## Boundaries
- No implied access to private property or protected asset inventories.
- No vehicle tracking or worker monitoring without explicit authority, privacy review and retention rules.
- No grant award or endorsement is assumed. Government introductions are not funding decisions.
- No assertion that a third-party state platform has zero users without documented evidence.
- No live integrations or map UI claimed by this document.

## Candidate pitch proof
- One live or permitted replayed corridor with source attribution.
- One credible field workflow on a real map.
- A comparison against baseline operations, including unknowns.
- A pilot scope, privacy/licensing matrix, cost envelope and deployment model.

Code slice: `src/core/fleet-asset-context.mjs` and `test/fleet-asset-context.test.mjs`. The synthetic fixture is intentionally not represented as a council dataset.
