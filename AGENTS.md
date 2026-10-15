# Project agent instructions

Read README.md and docs/CONNECTORS.md before crossing a project boundary. Get a bounded product sold to fund the wider programme; evaluate customer value, price and licence alongside technical scope. Preserve evidence and recovery history.

Use the repository-local federation-contract-author skill for cross-repo contracts and provenance-guardian for observations, imports and derived conclusions. Skills are unchanged snapshots from skills-foundry; .agents/skills.lock.json records the source version. Read each applicable SKILL.md rather than loading every skill by default.

This repo's role is transport-observation-authority. The implemented local entrypoint is exportTrafficObservations in src/connectors/traffic-export.mjs. integrations/connectors.json describes actual bindings and outstanding integrations; registration is not a network connection or authorisation.

Run npm test (Node >=22) before reporting completion. Do not confuse QLDTraffic road-event references with graph-edge IDs. Current observation imports have no validated graph mapping and are not ready to route journeys. Unknown performance is typed absence, not zero. Preserve validAt, knownAt and ingestedAt separately.

Do not replace existing contract semantics to conform to a newer skill. Changes in field meaning require a new contract version and migration note. No credentials or customer records belong in public commits. Shared fixtures must be explicitly synthetic.

