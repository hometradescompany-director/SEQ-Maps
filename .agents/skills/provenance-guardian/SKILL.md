---
name: provenance-guardian
description: Preserve the path from source to conclusion — immutable originals, separately identified derivatives, typed absence, supersession without deletion. Use when handling documents, imports, extracted or derived data, audit trails, or any claim whose origin matters.
---

# Provenance Guardian

A system that preserves only its successful final state has destroyed the
information required to explain that state.

Preserve the path:

```text
Identity → Event → Transformation → Evidence → Outcome
```

Every link is recorded. A missing link is *typed*, never silent.

## Hard rules

- **Originals are immutable.** Never modify an ingested artifact. Ever.
- **A derivative is a distinct object** with its own identity and a recorded link to
  its source and to the transformation that produced it.
- **Absence is typed.** No silent nulls, no empty strings standing in for facts.
- **Supersede, never delete.** The predecessor remains and names its successor.
- **Source evidence ≠ interpretation ≠ current governing truth.** These are three
  objects. Collapsing any two of them is the failure this skill exists to prevent.
- **Attribution is split**: who authored the source, who performed the
  transformation, and who asserts the current interpretation are three different
  answers.
- **Uncertainty survives transformation.** A confidence of 0.6 at extraction does not
  become a fact downstream.

## The three-object rule

| Object | Question it answers | Mutable? |
| --- | --- | --- |
| Source evidence | What was actually received or observed? | Never |
| Interpretation | What did we conclude from it, when, by what method? | New version each time |
| Governing truth | What does the system act on right now? | Changes, with the change recorded as an event |

An extracted invoice total is interpretation. The scanned PDF is evidence. The amount
the system will pay is governing truth. When the extraction is corrected, evidence is
untouched, a new interpretation supersedes the old, and governing truth changes via
an event. Three records, three lifetimes.

## Typed absence vocabulary

Use exactly these states. Add to the list only with a written reason.

| State | Meaning |
| --- | --- |
| `known` | Established, with the evidence recorded |
| `unknown` | Known to be unestablished; no claim either way |
| `not_searched` | No attempt was made |
| `searched_no_match` | Searched; nothing adequate found. **Not** proof of non-existence |
| `inaccessible` | Exists but could not be read from here |
| `superseded` | Replaced; the successor is named |
| `contradictory` | Sources disagree; the conflict is unreconciled and visible |
| `provenance_lost` | Existed once; the trail is broken |
| `never_existed` | Positively established as never having existed — the strongest claim, and the rarest |

`searched_no_match` and `never_existed` are not synonyms. Treating them as one is the
most common provenance error in practice: a failed search becomes a stated fact, and
nothing downstream can tell the difference.

## Procedure

1. **Capture the original unchanged.** Store bytes as received. Record the hash
   (`sha256` unless a stronger requirement exists), size, received-at, and the source
   channel.
2. **Record the receipt as an event** with an actor. "Uploaded by", "fetched from",
   "handed over by" — never "appeared".
3. **Record the transformation**: what method, what version of that method, when, by
   whom or by what, with what parameters. A re-run with a newer extractor produces a
   *new* derivative, not an update.
4. **Link the derivative to its source** by identity and hash, so the link survives
   renaming and moving.
5. **Carry uncertainty forward.** Per-field confidence and evidence standing travel
   with the derivative and are visible wherever the field is displayed.
6. **Type every gap** using the vocabulary above, at the point the gap is discovered.
7. **Supersede on correction.** New version, predecessor named, reason recorded, old
   version still retrievable.
8. **Keep contradictions visible** until they are actually reconciled by someone who
   can. Do not pick a winner silently, and do not average.

## Hashes

Hash the original at intake and re-verify on read where integrity matters. A hash
proves the bytes are unchanged. It does not prove the content is true, that the
source is trustworthy, or that the interpretation is right. Say what it proves and no
more.

## Worked example

*Request: "when we scan a compliance certificate, fill in the property's expiry date."*

1. **Original.** PDF stored unchanged, `sha256` recorded, `received_at`, uploaded by
   a named user.
2. **Event.** `certificate.received`, actor = that user.
3. **Transformation.** `ocr-extract v2.1` produces
   `{ expiry_date: "2027-03-14", confidence: 0.82 }` — a derivative with its own id,
   linked to the source hash.
4. **Governing truth.** The property's compliance expiry is set by an event
   `property.compliance_expiry_asserted`, citing the derivative. If a human later
   corrects the date, that is a new assertion superseding the old — the OCR
   derivative is not edited, because that is what the machine actually read.
5. **Absence.** A certificate with an unreadable expiry records
   `expiry_date: { state: "inaccessible", reason: "unreadable region" }`. It does not
   record `null`, and it does not guess from the issue date.
6. **Contradiction.** A second certificate for the same property with a different
   expiry sets `contradictory` and surfaces both, rather than the later one winning
   by arrival order.

The tempting wrong design — write the extracted date straight onto the property row —
answers the question faster and makes "where did this date come from, and was it a
person or a machine" permanently unanswerable.

## Pressure tests

- Pick any displayed value: can you reach the original artifact it came from, and the
  method that produced it?
- Is any null in the schema doing the work of a typed absence?
- Is any derived value stored in the same field as a directly observed one?
- Can a correction be made without destroying what was previously believed?
- Does any code path modify an ingested original — including "normalising" it?
- Does a failed lookup anywhere render as "none" rather than "not found"?
- If the extractor is re-run with a better version, do you get a new record or an
  overwrite?

## Stop conditions

- The design writes extracted or inferred values into the same field as observed
  fact.
- Correction requires deleting or editing a prior record.
- Any absence is representable only as `null`.
- An original would be modified, re-encoded or normalised in place.
- A contradiction would be silently resolved by recency, source order, or averaging.
