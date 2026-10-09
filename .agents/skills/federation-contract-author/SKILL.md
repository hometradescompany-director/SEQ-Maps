---
name: federation-contract-author
description: Design and version bounded contracts between independently owned systems. Use when two systems need to share capability or data, when deciding whether something is a nested feature, a standalone product or a federated system, or when a boundary between projects is being crossed.
---

# Federation Contract Author

Two systems that share a database share a fate. A contract exists so that one can
change, fail, or be rebuilt without taking the other with it.

The contract is the product of this skill — not the integration code. Write the
contract first; the code follows it.

## Hard rules

- **Each side owns its own truth.** A contract transfers references and statements,
  never ownership.
- **No shared tables across a boundary.** Shared storage is not federation; it is one
  system with two front doors.
- **Cross-boundary identifiers are opaque.** The other side must not be able to infer
  meaning, ordering or volume from them, and must never receive PII it does not need.
- **Contracts are versioned from v1.** There is no unversioned contract.
- **Breaking changes ship as a new version alongside the old**, never as an edit.
- **Every contract declares its failure behaviour.** Undefined degradation is a
  defect.

## Choose the relationship shape first

| Shape | Use when | Cost |
| --- | --- | --- |
| **Nested projection** | One system owns the truth; the other only displays or filters it | Cheapest. No independent lifecycle for the nested side |
| **Standalone product** | Separate users, separate value, no runtime dependency | Duplication risk if the domains overlap |
| **Federated system** | Both own real truth, both evolve independently, both need the other's capability | A versioned contract, compatibility work, degradation design |
| **Fused state** | Genuinely one thing that was wrongly split | Only legitimate when the split itself was the error — document why |

Fused state is the answer people reach for because it is easy. Justify it explicitly
or reject it. "It's simpler if they share the table" is the sentence that creates the
next migration.

## Contract contents

Every federation contract states, explicitly:

1. **Authority boundary.** Which side is authoritative for each fact named. No fact
   appears twice with two authorities.
2. **Exposed surface.** Operations, their inputs, outputs and error shapes. Nothing
   implicit.
3. **Identity translation.** How each side refers to the other's entities. Opaque,
   pseudonymous references where the boundary requires it, with the mapping held by
   exactly one side.
4. **Data classification.** What crosses, at what sensitivity, and what must never.
5. **Version and compatibility.** Version identifier; what constitutes additive
   versus breaking; how long the previous version is supported.
6. **Failure and degradation.** What the caller does when the provider is
   unavailable, slow, or returns a version it does not understand. Name the fallback
   state and whether it is safe to serve.
7. **Lifecycle and rollback.** How either side deploys, rolls back, or withdraws
   without coordinating a release with the other.
8. **Observability.** How each side proves the contract was honoured.

## Compatibility rules

- **Additive is safe:** new optional fields, new operations, new event types.
  Consumers must ignore unknown fields.
- **Breaking is a new version:** removing a field, narrowing a type, changing a
  meaning, changing an error shape, tightening a required field.
- **Meaning changes are breaking even when the type does not change.** Redefining
  what `active` means silently corrupts every consumer. This is the one people miss.
- Run two versions concurrently through any migration. Name the retirement date for
  the old one, or accept that it is permanent.

## Degradation design

For each operation the caller depends on, decide before shipping:

- **fail closed** — deny the action (correct for permissions, payments, safety);
- **fail open with a typed unknown** — proceed while recording that the fact could
  not be established (correct for enrichment and display);
- **serve last known, labelled stale** — with the age visible;
- **queue and reconcile** — for writes that can be applied late.

Never silently substitute a default for an unavailable fact. A default that looks
like an answer is worse than an outage.

## Worked example

*Request: "HTC Hub should show Atlas's property intelligence on the job screen."*

1. **Shape.** Both systems own real truth — Atlas owns property identity and history;
   HTC Hub owns jobs. Independent lifecycles. → **federated system**, not a nested
   projection, and certainly not a shared property table.
2. **Authority.** Atlas is authoritative for property identity, history and evidence.
   HTC Hub is authoritative for jobs and their scheduling. Neither stores the other's
   facts.
3. **Identity.** HTC Hub holds an opaque `property_ref` issued by Atlas. It carries no
   address, no owner name, no sequential id. Atlas holds the mapping.
4. **Surface.** `v1.getPropertySummary(property_ref)` returning a bounded summary and
   a typed evidence standing per field. No bulk export, no PII.
5. **Degradation.** Atlas unavailable → the job screen renders with property
   intelligence marked `inaccessible`, not blank and not cached-silently. The job
   itself is unaffected: HTC Hub does not depend on Atlas to do its own work.
6. **Versioning.** `v1`. Adding a field is additive. If `condition_score` ever changes
   meaning, it ships as `v2` alongside `v1`.
7. **Rejected alternative.** Copying property records into HTC Hub. It reads faster
   and it creates two property truths that diverge the first time an address is
   corrected in one system.

## Pressure tests

- Can each side deploy, roll back and have an outage independently? Walk each case.
- Name every fact that appears on both sides. For each, name the single authority.
- Can the consumer infer anything from the identifiers it receives — counts,
  ordering, who someone is?
- What does the consumer show when the provider is down, and is that state visibly
  distinguishable from a real answer?
- If the provider changed a field's *meaning* tomorrow, would the consumer notice?
- Could the consumer be replaced by a different system without the provider changing?

## Stop conditions

- The proposal shares a table, a schema or a database across the boundary.
- PII crosses a boundary that does not need it.
- The contract is unversioned.
- Degradation behaviour is unspecified for any operation the caller depends on.
- Both sides claim authority for the same fact — resolve ownership before writing any
  integration code.
