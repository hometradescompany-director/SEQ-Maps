# QLDTraffic Events source

## Identity

- Source: Queensland Department of Transport and Main Roads, QLDTraffic Events API
- API family: QLDTraffic GeoJSON API
- Intended use: third-party integration of dynamic traffic and road-event information
- Licence: Creative Commons Attribution 4.0
- Authentication: API key required
- Transport: HTTPS
- Representation: GeoJSON

## Why this source is first

This is the smallest useful real-world source that can exercise the SEQ Maps proof spine without introducing routing, map rendering or corridor analytics prematurely.

The documented event feed includes dynamic road-network events such as crashes, hazards, congestion, roadworks, special events and environmental restrictions.

## Boundary

The adapter is responsible only for translating a QLDTraffic GeoJSON Feature into the provider-neutral observation envelope.

The adapter does not:

- fetch live data without an explicitly configured API key;
- persist credentials;
- decide route changes;
- render maps;
- collapse source timestamps into local ingestion time;
- relicense QLDTraffic data.

## Time mapping

For an event Feature:

- `validAt` uses `properties.duration.start` when present;
- `knownAt` uses `properties.published` when present;
- `ingestedAt` is supplied by the caller at ingestion time.

If a required timestamp is unavailable, normalization fails explicitly rather than inventing one.

## Identity mapping

- Source reference: `qldtraffic:events:v2`
- Observation id: `qldtraffic:event:<properties.id>`
- Subject reference: `qldtraffic:road-event:<properties.id>`

Road-segment identity is deliberately deferred. The first adapter proves source normalization before attempting cross-provider road identity reconciliation.
