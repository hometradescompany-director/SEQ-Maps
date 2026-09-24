# SEQ Maps architecture

SEQ Maps is a transport-domain product, not a second general-purpose orchestration layer. It owns only the domain state required to turn transport observations into useful, auditable local context.

## What does it own?

- configured transport-source and adapter identities;
- normalized transport observations and domain events;
- transport-domain references to places and road segments;
- relationships between sources, observations, events, evidence and derived context;
- local traffic-context projections;
- proof metrics used to evaluate bounded deployments.

It does not own upstream provider truth, third-party datasets, user identity systems, or another platform's internal state.

## What does it know?

SEQ Maps may read permitted public/open transport feeds, mapping and routing provider APIs, configured local sensor observations, and documented external capability contracts. Provider-specific payloads terminate at adapters.

## What events does it emit?

Initial event family:

- `source.observed`
- `transport.condition.observed`
- `transport.incident.observed`
- `segment.context.changed`
- `proof.metric.recorded`

New event types require a demonstrated consumer or proof need.

## What relationships does it maintain?

```text
Source
  -> Observation
     -> Place / RoadSegment
     -> TransportEvent
        -> Evidence
        -> LocalContextProjection
        -> ProofMetric
```

Relationships are references, not copied foreign records.

## Time semantics

Three timestamps stay distinct whenever the source permits it:

- **valid_at**: when the represented condition was true;
- **known_at**: when the claim became known to the relevant observer/system;
- **ingested_at**: when SEQ Maps received or recorded it.

No implementation may silently collapse these into one timestamp.

## Boundary discipline

SEQ Maps interoperates through documented contracts and opaque references. External map/routing providers are adapters. Replacing one provider must not require redesigning the transport-domain core.

## First pressure test

The bootstrap succeeds only when one bounded corridor demonstrates:

```text
external source
-> normalized observation
-> domain event
-> local context
-> API
-> map rendering
-> measurable benefit
```

A large feature count is not itself evidence of usefulness.
