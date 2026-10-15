# Offline connector federation v1

## Ownership and operations

| Owner | Operation | Input | Output |
|---|---|---|---|
| SEQ-Maps | exportTrafficObservations | Array of existing observation envelopes | traffic-observations.v1 |
| Traffic-Management-Swarm-Topology- | ingestTrafficObservations | traffic-observations.v1 | traffic-ingest-receipt.v1 |
| Swarm-city-hub | projectTrafficReceipt | traffic-ingest-receipt.v1 | city-traffic-summary.v1 |

Imports are local JavaScript calls and JSON-compatible values. There are no HTTP services, sockets, credential bindings, automatic forwarding or controller connections in this bootstrap. Each repo runs independently with Node >=22. Peers need not be installed to run its unit tests. The existing SEQ Maps QLDTraffic adapter is reused; live fetch setup is still absent.

## Contract shapes

Maps owns the existing envelope fields: id, kind, sourceRef, subjectRef, validAt, knownAt, ingestedAt, license, evidenceRef and payload. The batch adds contract and producer. Traffic independently checks the transported version, producer, identifiers, timestamps and licence standing, rejecting duplicate observation IDs. New optional fields are ignored. Timestamps retain the existing ISO-compatible parser semantics; tightening these requires a new version.

The receipt retains source and observation references, distinct timestamps, licence and evidence reference. It strips the raw payload, records mapping.state as unknown with a reason and sets routingReady to false. A receipt establishes successful local shape validation, not authenticity, geographical identity, source freshness, data-sharing permission or routing suitability. Producer text is not authentication.

City receives the receipt and produces observationRefs, receivedCount, routingReady=false, controllerAuthority=false and a typed performance absence: state=not_searched, reason=No evaluation result supplied. It does not own source truth or create traffic decisions.

## Data and identity

Initial tests use synthetic observations. These functions do not perform a data-rights decision; callers remain responsible for ensuring material can be processed and shared. Traffic receipts omit raw provider payloads; do not send personal information in identifiers. Road-event identity remains owned by Maps. Graph-edge reconciliation is a future separate mapping, not string substitution.

## Version and errors

Contract families start at v1. Unsupported versions, unexpected producers, malformed required fields and duplicate identities throw TypeError. Empty arrays are valid. Unknown optional fields do not grant authority. Calling applications must catch failures and display an unavailable state rather than substitute data or zeros; these pure functions do not implement that display. Breaking semantic changes introduce v2 alongside v1; these initial v1 contracts remain supported until a documented migration and retirement decision exists.

## Lifecycle and evidence

Pure functions make no writes and mutate no input. Each repo can update or roll back independently while keeping compatible v1 functions. There is no shared database. A caller may retain input bytes and hashes plus a transformation receipt; persistent storage, hashing, replay and causal evaluation are not implemented by these functions.

Unit tests prove shape validation, timestamp preservation, missing graph mapping, bounded city output and unsupported-version rejection. Local end-to-end validation covers the full three-function path using the existing synthetic QLDTraffic fixture. Live feeds, coordinated routing algorithms and customer-data operation require additional implementation and validation.

## Skills and compatibility notes

Two unchanged skills are installed from the creator's skills-foundry and pinned in .agents/skills.lock.json. The federation skill governs this versioned boundary. Provenance guidance is a design target, not a claim that storage already exists. Existing evidenceRef=null and payload=null semantics remain supported in v1; future typed absence requires an explicit new envelope version rather than a silent rewrite. Scope remains bounded and commercial value must be demonstrated.

