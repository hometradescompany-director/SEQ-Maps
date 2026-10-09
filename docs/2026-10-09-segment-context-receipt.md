# Segment context continuation receipt — 2026-10-09

## Objective and authority

Repository owner requested autonomous continuation of established maps scope using
Dory and Foundry methods, then clarified that skills are contextual doctrines whose
applicability must be reassessed across holons/layers. [Applicability receipt](SKILL_APPLICABILITY.md)
preserves that correction without claiming universal validity or cross-hub activation.

Scope evidence: ARCHITECTURE.md proof spine, README.md, and
[PR #3 next proof step](https://github.com/hometradescompany-director/SEQ-Maps/pull/3).
Remote base observed: `c7ee79d3fa77ca1a689f6a2b0860f101a40ce733`,
tree `fc940262e52379dc2555a35ec87b91638fd4c31c`.
Foundry procedure snapshot: `06988a9928d4947ca4e61bfe8b53445696e9774e`.

## Observable transitions

1. Empty workspace recovered through connected GitHub file reads after git clone
   failed to connect to the configured proxy. Local git history is a reconstruction,
   not a clone of canonical repository history.
2. Added explicit evidence-linked observation-to-segment bindings, reference-only
   attributable events and historical SegmentContext/v1 projections.
3. Added a read-only context handler and deterministic synthetic proof command.
4. Independent review exposed serialization-after-headers, sparse-array evidence
   and invalid-calendar normalization defects. Regression tests reproduced each;
   fixes were implemented and re-reviewed with no remaining important findings.
5. Verified repository tests/checks and the full in-process test suite. Publishing
   is a separate external transition; this receipt does not assert a merge.

## Verification

- `npm test`: exit 0, eight test files pass.
- `npm run check`: exit 0, eight test files pass.
- `node --test --test-isolation=none`: 38 cases, 37 pass, zero fail, one explicit skip.
- `npm run proof:segment`: exit 0; synthetic source-to-context result generated.
- `git diff --check`: exit 0.

The skipped test is real loopback HTTP delivery. An independent empty HTTP server
also failed with `listen EPERM`, establishing the restriction before handler
execution. In-process handler checks cover routing, query validation, read-only
behavior, typed absence and safe errors; they do not establish socket delivery.
CI retains the real HTTP test, with EPERM surfaced as a skip.

No live source ingestion, real road alignment, causal traffic conclusion,
government endorsement, tamper-evident Witness installation, corpus inventory or
background swarm scheduler is claimed. Source references are present, not
independently verified source claims. Provider usage metadata and token/cost savings
are `unknown`.

## Recovery and next established work

Rebuild context from retained observations, bindings and events at a named asOf
instant. Observation revisions must have immutable unique identities. Run the proof
command and tests to reproduce this pass. Remove the additive context branch to
roll back its capability; original adapter/core/analytics remain the prior owners.

The next transitions remain established rather than requiring invented scope:

- Resolve real permitted road geometry/identity with attribution and alignment evidence.
- Add a map projection over the read contract and measure a bounded corridor proof.
- Connect repeated corridor intervals to the existing descriptive analytics with evidence references.
- Reconcile open provider/GIS-drift/fleet PRs #5, #9 and #11 through their own tests and reviews.
- Continue issue #6 professional-corpus discovery, retaining source/terms verification;
  the 197 target is not a licence to fabricate records.

One recovered state discrepancy remains: PR #10 metadata reports a merge, while the
observed main snapshot does not contain its professional-hub implementation.
Treat this as `contradictory` retrieval evidence requiring reconciliation, not as
proof the implementation was never made. No history is rewritten to hide it.
