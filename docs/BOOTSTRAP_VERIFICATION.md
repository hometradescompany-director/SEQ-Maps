# Bootstrap verification receipt — 9 October 2026

Scope: unchanged repo-local federation/provenance skills plus offline Maps -> traffic -> city connectors. The third repository was provisionally selected as Swarm-city-hub from the creator's recent repositories and is kept on a review branch.

- Existing SEQ Maps test suite passed before edits.
- New connector tests failed before their modules existed, then passed after implementation.
- Independent review identified a missing city provenance check. A regression test failed before the correction and passed afterwards.
- `npm test` passed in each of the three local repository snapshots.
- A synthetic QLDTraffic Feature traversed the existing normaliser, Maps export, traffic import and city projection. Assertions verified original valid/known/ingested times and no routing or controller authority.
- All twelve installed skill/agent-metadata files across the three repos matched their upstream Git blob hashes exactly. Local README links and registry module paths were checked.

Repository snapshots were fetched through the GitHub connector because the shell proxy could not connect for Git cloning. No live road feed, physical controller, persistent provenance store, replay engine or coordinated-routing algorithm was tested or implemented by this bootstrap. New CI workflows are supplied for the two initial repositories; remote CI status is separate from the local test result.

The skills are reused from the creator's skills-foundry, not newly authored. Application review confirmed their boundary/provenance procedures and recorded compatibility gaps with legacy null fields; existing v1 meanings remain unchanged.

