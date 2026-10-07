# Professional Hubs v0.1

SEQ Maps will represent professional services as role projections over one shared hub contract rather than 197 bespoke implementations.

Shared shape:

professional_entity
  identity
  role / profession
  jurisdiction
  registration / qualification references
  capabilities
  service area
  contact channels
  source evidence
  authority / regulator
  licence / terms
  freshness
  availability when legitimately published
  relationships

The planned 197 professional entities are a verification corpus, not a number to fill with invented records. Each entity must be sourced from an authoritative or clearly attributable public source and retain provenance, jurisdiction and terms.

`src/core/professional-hub.mjs` provides the shared `createProfessionalHub` contract. It requires an identity, role, profession, jurisdiction, authority/regulator, source evidence, terms standing, and observation/review times; optional capabilities and relationships stay descriptive. Terms may remain explicitly unknown, but source evidence may not be omitted. Creating or discovering a hub sets no execution authority.

Useful adjacent service classes include regulators and licensing bodies, local and state government services, utilities and infrastructure operators, planning and development services, emergency and community services, environmental services, transport and accessibility services, public registers, authoritative spatial datasets, legitimate appointment services, calculators, reporting tools and government document services.

These relationships are descriptive, not endorsements.
