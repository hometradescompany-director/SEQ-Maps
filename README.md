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

## Repository status

Bootstrap stage. Architecture and contracts come before UI.

## Licence

Software in this repository is licensed under the Apache License 2.0 unless a file states otherwise.

External datasets, APIs and source material retain their own licences and terms. See `THIRD_PARTY_DATA.md`.
