# SEQ Maps Source Registry v0.1

The source registry inventories machine-readable services SEQ Maps may evaluate. It is separate from the observation pipeline.

Every source should carry a stable identifier, publisher, jurisdiction, canonical URL, endpoint, protocol or format, declared capability, authority standing, licence and terms, observation time, and expiry or review date where applicable.

Discovery creates a candidate. It does not create permission, trust or execution authority. A source becomes accepted only after its endpoint, publisher, authority scope and licence/terms standing have been verified.

The shared record validator is `src/core/source-registry.mjs`. Accepted records require a jurisdiction, endpoint, protocol, licence, terms URL, observation and review times, and at least official authority standing. `sourceSupports` only evaluates that metadata and the declared standing; it never grants execution authority. The current Queensland seed records are in `data/sources/qld-seq-seed.json`.

The seed includes the following foundational Queensland sources; their canonical dataset pages remain the provenance anchors:

| Source | Canonical record |
|---|---|
| MapsOnline API | https://www.data.qld.gov.au/dataset/mapsonline-api |
| Local government area boundaries | https://www.data.qld.gov.au/dataset/local-government-area-boundaries-queensland |
| Locality boundaries | https://www.data.qld.gov.au/dataset/locality-boundaries-queensland |
| Buildings series | https://www.data.qld.gov.au/dataset/buildings-queensland-series |

The source records declare CC BY 4.0 terms and Queensland Government attribution. Observation and review timestamps are metadata, not guarantees that an endpoint or dataset remains unchanged; re-verify before use.

Multiple sources may disagree. SEQ Maps preserves competing observations and provenance rather than flattening them.

SEQ Maps may discover and normalize permitted public information. It must not probe private systems, bypass authentication, infer permission from discoverability, or silently relicense third-party material.
