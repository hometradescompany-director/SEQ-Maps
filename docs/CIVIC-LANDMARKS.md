# Civic landmark proof: hospitals, council chambers, major public buildings

## Audience and demonstration

Target facilities are recognizable anchors for council and state fleet workflows: major hospitals, council chambers/town halls and selected government service buildings. A landmark is a **context anchor**, not evidence of an agency relationship, asset ownership, access permission, emergency route or endorsement.

The first runnable exploration surface is [demo/civic-landmarks.html](../demo/civic-landmarks.html). Open it through a local static web server, e.g. `python3 -m http.server 8000`, then visit `http://localhost:8000/demo/civic-landmarks.html`. It queries the public Overpass API only when a person presses the discovery button. A small bounded map viewport prevents accidental broad scraping. OpenStreetMap tags are community contributed and can be incomplete, duplicated or stale. No facility is pre-certified.

## Proposed pilot storyboards

1. **Hospital precinct:** select a mapped hospital and inspect nearby road and publicly licensed transport observations. Do not infer ambulance routes, emergency priority, internal access or clinical data.
2. **Council chamber precinct:** select a mapped town hall or government office, then show publicly sourced roadworks and asset observations with source timestamps. Government-office tags may not actually identify a council chamber: validate with official agency data.
3. **Field crew corridor:** switch to the synthetic [fleet corridor proof](../demo/fleet-corridor.html), select a drainage or lighting asset and inspect its evidence and licence. This remains synthetic until a permitted council source is integrated.

## Data contract for future landmark registry

- stable upstream feature reference (e.g. OSM type/id), canonical name and aliases
- category and authoritative facility operator (unknown until verified)
- point or polygon geometry with source reference, licence, observed/updated timestamps
- confidence/verification standing: community-mapped, official-source-confirmed or unknown
- separate access, road and infrastructure context; never infer property rights from a map pin
- provenance links and stale-data policy; retain discrepancies rather than silently overwriting

## Acceptance gates before a government presentation

- confirm a bounded target area and 3–5 facilities against official sources
- capture reproducible data snapshots under the source's usage/licence rules
- replace public demo API dependency with a licensed/cached provider or permitted snapshot
- demonstrate a genuine, timestamped government feed and show its coverage gaps
- review OSM/Overpass service limits, attribution and privacy; verify live map rendering
- benchmark accuracy, source freshness and task time versus current field workflow

**Status:** code committed to an open PR; browser runtime and live public endpoint not yet validated. No claimed government partnership, funding, integration or production access.
