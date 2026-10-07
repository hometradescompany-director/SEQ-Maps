# M1 variable-speed proof slice

## Why this exists

A recurring Southeast Queensland motorway question is whether a variable speed intervention is helping traffic move, helping vehicles merge, or merely reducing the displayed number while queues continue to grow.

This proof slice gives SEQ Maps a provider-neutral way to compare already-observed corridor intervals across speed-management states.

It does **not** claim that 60 km/h, 80 km/h, 100 km/h, or any other posted speed caused the observed outcome.

## Measures

For each bounded interval, record:

- posted speed limit;
- interval duration;
- observed flow in vehicles per hour;
- queue size;
- mean travel time;
- merge attempts;
- merge success ratio;
- source/evidence references when connected to live observations.

The first descriptive comparison produces:

- throughput delta;
- mean-flow delta;
- queue delta;
- travel-time delta;
- merge-success delta;
- an explicit causal standing of `not-established`.

## Hypothesis under test

A candidate operational hypothesis is:

> During recurring congestion, an intermediate variable speed setting may outperform a more severe reduction if it preserves merging opportunities and corridor throughput without creating an unstable queue.

That is a hypothesis, not a conclusion.

## Evidence required before a real claim

A field evaluation should control or stratify for at least:

- time of day and day of week;
- demand entering the corridor;
- lane closures and roadworks;
- crashes, hazards and special events;
- weather;
- ramp-metering state;
- lane count and geometry;
- downstream bottlenecks;
- duration of the posted speed state;
- enforcement or driver-compliance effects;
- any changes to signal or motorway-control logic.

Comparisons should use repeated observations rather than a single bad drive.

## Provenance posture

The included M1 fixture is deliberately synthetic and must never be presented as Queensland Government traffic data or evidence that one speed setting is superior.

The safe progression remains:

```text
live source
-> normalized observation
-> road-segment identity
-> corridor interval
-> descriptive metric
-> matched / controlled comparison
-> evidence-backed operational conclusion
```

Until the controlled-comparison step exists, the system may say what moved together. It may not say what caused what.
