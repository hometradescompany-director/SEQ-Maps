# Segment context proof

Scope derives from ARCHITECTURE.md and the next proof step in PR #3: connect
normalized observations to road-segment identity with evidence preserved.
The user authorised continuing established scope on 2026-10-09 without repeating
scope approvals. This pass executes that existing spine in the current session.

## Ownership and design

SEQ Maps owns asserted relationships between opaque observation and segment
references, and attributable transport derivation events. It reads the existing
observation envelope; it does not own provider road-network identity or source truth.
The consumer is a rebuildable local-context projection exposed through a read-only
HTTP handler. Removing this branch breaks that proof path, not source ingestion.

An explicit binding carries actor, recorded time, evidence references and
`asserted` standing. It never guesses a segment from a road name or coordinates.
Events reference observations and bindings rather than duplicating their payload.
The input ledger remains caller-owned. Corrections append new events with explicit
supersession; previous events remain retrievable. Supersession must stay within
the same source, subject and segment and move forward in recorded time.

Rebuild with a required `asOf` time. Only events whose condition, source knowledge,
ingestion, binding and event recording times are at or before that instant may
participate. Missing references and duplicate identities fail explicitly.
Unrelated claims and competing correction branches stay visible. No matching claim
returns `searched_no_match`, never a claim that the road is clear. Missing evidence
returns `unknown`. Licence standing is preserved; acceptance never grants usage,
routing, enforcement or causal authority.

The HTTP adapter serves GET /v1/segments/:encodedRef/context?asOf=:timestamp.
It has no write, provider-fetch, credential or authentication capability and is
intended only for public/synthetic data on a loopback-bound local proof server.
Private observations require a separately authorised authentication contract.

## Implementation plan

1. Write failing invariant tests for explicit evidence-backed binding and reference
   events; implement src/core/segment-context.mjs using the existing envelope.
2. Add replay tests for late arrival, explicit correction, competing branches,
   missing evidence, broken references, input immutability and deterministic order;
   implement projectSegmentContext in the same bounded core branch.
3. Write real HTTP tests for read-only routes, invalid requests and safe errors;
   implement src/api/segment-context.mjs and a runnable synthetic proof.
4. Run the whole repository test suite and check command, inspect the complete diff,
   obtain an independent review and publish a draft PR. Record evidence and gaps.

## Validation and remaining scope

Synthetic proof verifies contracts, replay and HTTP delivery. It cannot establish
real segment alignment, feed freshness, field usefulness or controlled causal
conclusions. Live source access, geometry resolution, map rendering and repeated
corridor metrics remain further established work. Open PRs #5, #9 and #11 retain
their independent histories; this pass does not duplicate or merge them.

## Read contract

Call `createSegmentContextHandler({ readLedger })` with an authorised public or
synthetic ledger reader. Attach the returned Node HTTP handler to a loopback
server. The core accepts arrays named `observations`, `bindings` and `events`,
an opaque `segmentRef`, and a mandatory timezone-qualified `asOf` timestamp.
Replay timestamps support millisecond precision (one to three fractional digits).

The caller must retain immutable, uniquely identified observation revisions.
The existing QLDTraffic adapter identifies a provider event, so subsequent versions
of that event need distinct observation-envelope identities at ingestion before
being placed in the same ledger. This slice supplies no ingestion store.

200 returns SegmentContext/v1; 400 rejects malformed queries; 404 names an absent
route; 405 rejects writes; 503 types source/ledger/serialization failure as
`inaccessible`. The response never includes internal diagnostics. Its payload
retains source fields, so callers must supply only data permitted for this surface.
`observed` means observations are present, not that their claims were independently
verified. Evidence state `known` means an evidence reference is present, not that
its content is verified. Unreconciled revisions of one source subject remain
`contradictory`. No claims match means `searched_no_match`, not a clear road.

Run `npm run proof:segment` for a deterministic synthetic source-to-context proof.
Local in-process handler checks and a real loopback HTTP test are separate. The
HTTP test explicitly skips only EPERM where the execution sandbox forbids sockets.
See [skill applicability](SKILL_APPLICABILITY.md) for the contextual method receipt.
