# SEQ Maps Source Registry v1

The source registry inventories machine-readable services SEQ Maps may evaluate. It is separate from the observation pipeline.

`createSourceRecord` normalizes one source record with a stable identifier, publisher, jurisdiction, canonical URL, endpoint, protocol or format, declared capabilities, authority standing, licence and terms, observation time, and expiry or review date where applicable. Optional metadata remains explicitly `null`; it is not inferred. The record and capability list are immutable.

Discovery creates a candidate. It does not create permission, trust or execution authority. A source becomes accepted only after its endpoint, publisher, authority scope and licence/terms standing have been verified.

Multiple sources may disagree. SEQ Maps preserves competing observations and provenance rather than flattening them.

SEQ Maps may discover and normalize permitted public information. It must not probe private systems, bypass authentication, infer permission from discoverability, or silently relicense third-party material.

The registry contract is descriptive: accepted standing and authority rank do not themselves authorize endpoint execution.
