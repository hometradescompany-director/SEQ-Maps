# Moving-bottleneck proof slice

## Purpose

This slice tests whether a sustained under-speed vehicle in a non-left lane is a plausible moving bottleneck under otherwise faster traffic conditions.

It is deliberately an analytics proof, not an infringement engine.

## Architecture boundary

### What does it own?

No new authoritative registry or persistent identity.

This slice owns only derived, reproducible analytics over already-observed traffic samples:

- weighted speed deltas;
- lane-occupancy ratios;
- left-lane-availability ratio;
- overtaking ratio;
- following-queue delta;
- candidate / not-candidate standing.

### What does it know?

It consumes bounded observation windows containing:

- an opaque track reference;
- posted speed;
- observed vehicle speed;
- surrounding median speed;
- lane index and lane count;
- whether a leftward lane was available;
- whether the vehicle was overtaking;
- following-queue size.

It does not require or store registration plates, driver identity, owner identity, facial data, or any other PII.

### What events does it emit?

None in this first proof.

The detector is a pure derivation function. A future event such as `transport.moving-bottleneck.candidate.observed` should only be added when a demonstrated downstream consumer exists.

### What relationships does it maintain?

None persistently.

At evaluation time it relates one opaque track reference to one bounded corridor observation window. Source observations and evidence remain authoritative elsewhere.

## Candidate definition

A window can become a **candidate moving bottleneck** only when all configured thresholds are met.

The default proof thresholds are:

- at least 120 seconds observed;
- mean speed at least 15 km/h below the posted limit;
- mean speed at least 10 km/h below surrounding median flow;
- at least 80% of observed time in a non-left lane;
- a leftward lane available for at least 60% of observed time;
- overtaking for no more than 20% of observed time.

These are test thresholds, not Queensland law and not an enforcement recommendation.

## Why relative speed matters

A vehicle travelling at 80 km/h in a 100 km/h zone is not automatically a moving bottleneck.

If surrounding traffic is also moving at roughly 80 km/h because of congestion, weather, roadworks or another constraint, the individual vehicle is not isolated by this detector.

The slice therefore compares vehicle speed to both:

- the posted limit; and
- observed surrounding median speed.

## Impact evidence

The detector also records the change in following-queue size across the window.

A growing queue behind a candidate is an **impact signal**, not proof that the candidate caused the queue.

The result always preserves:

- `causalImpact: "not-established"`;
- `enforcementStanding: "not-authorized"`.

## Privacy and enforcement boundary

This proof must not become automated infringement issuance by accident.

A real enforcement pathway would separately require, among other things:

- a lawful offence definition;
- calibrated and approved measurement equipment;
- evidentiary chain of custody;
- identity resolution under appropriate authority;
- exception handling;
- contestability and review;
- an explicitly authorized enforcement workflow.

SEQ Maps should first answer the narrower engineering question:

> Can a sustained moving bottleneck be detected reproducibly from traffic observations without confusing slow traffic with one slow vehicle?

## Proof progression

```text
traffic observations
-> anonymous bounded track window
-> descriptive speed / lane metrics
-> candidate moving-bottleneck standing
-> repeated impact observations
-> controlled traffic-flow analysis
-> evidence-backed operational conclusion
```

A candidate flag is not a causal finding, a legal finding, or a fine.
