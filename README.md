# SEQ Maps

**Immediate constraint:** get a bounded useful product sold to fund development. Pricing, licensing and buyer value belong alongside engineering. Government and commercial buyers can be anywhere.

**Evidence constraint:** preserve observations, decisions and provenance. Coordinated routing must account for congestion its own recommendations create; measured comparisons establish usefulness.


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

## Engineering doctrine

For the shared **POS Systems / “Welcome to the Shit Show”** engineering posture and its application in this repository, see [README.POS.md](README.POS.md).

## Skills and connector bootstrap

Two repo-local skills cover federation contracts and provenance. See [agent instructions](AGENTS.md), [connector registry](integrations/connectors.json) and [offline federation contract](docs/CONNECTORS.md).

The local connector is implemented and tested. Live provider fetches, graph-edge reconciliation, routing algorithms and controller integrations remain separate work. Run `npm test` with Node >=22. Software licensing remains Apache-2.0; paid evaluation, support, integration and hosted services need commercial terms consistent with that licence.


