# Professional Hubs v0.1

SEQ Maps will represent professional services as role projections over one shared hub contract rather than 197 bespoke implementations.

The `createProfessionalEntity` contract in `src/core/professional-hub.mjs` normalizes an entity into an immutable record. Its required fields are a stable ID, identity name, profession, jurisdiction, and at least one source/evidence reference. Registration and qualification references, capabilities, service area, contact channels, regulator, licence/terms, freshness, legitimate availability, and descriptive relationships are retained when supplied.

Source evidence is a reference, not copied source content. Optional availability is not inferred, and descriptive relationships are not endorsements.

The planned 197 professional entities are a verification corpus, not a number to fill with invented records. Each entity must be sourced from an authoritative or clearly attributable public source and retain provenance, jurisdiction and terms.

Useful adjacent service classes include regulators and licensing bodies, local and state government services, utilities and infrastructure operators, planning and development services, emergency and community services, environmental services, transport and accessibility services, public registers, authoritative spatial datasets, legitimate appointment services, calculators, reporting tools and government document services.

These relationships are descriptive, not endorsements.
