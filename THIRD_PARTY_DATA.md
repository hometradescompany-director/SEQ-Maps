# Third-party data and API register

The Apache-2.0 licence for this repository applies to the software in this repository. It does **not** relicense third-party data, imagery, map tiles, APIs, feeds, documentation or other external material.

No external dataset is bundled in the repository at bootstrap.

Before a new source is used, record:

| Field | Required |
|---|---|
| Source name | yes |
| Source owner / publisher | yes |
| Canonical source URL | yes |
| Licence or terms identifier | yes |
| Attribution requirements | yes |
| Redistribution restrictions | yes |
| Commercial-use restrictions | yes |
| First observed date | yes |
| Version / revision / feed identity | when available |
| Adapter or ingestion path | yes |
| Notes / uncertainty | when needed |

Unknown licence standing is recorded as **unknown** and treated as non-redistributable until resolved.


## Registered source: QLDTraffic GeoJSON API

| Field | Value |
|---|---|
| Source name | QLDTraffic GeoJSON API |
| Source owner / publisher | Queensland Department of Transport and Main Roads |
| Canonical source | Queensland Government Open Data Portal / QLDTraffic API |
| Licence | Creative Commons Attribution 4.0 |
| Attribution | Preserve source/publisher attribution with derived uses |
| Redistribution | Subject to CC BY 4.0 and API terms |
| Commercial use | Permitted by CC BY 4.0 subject to licence conditions |
| First registered in SEQ Maps | 2026-09-24 |
| Adapter | `src/adapters/qldtraffic-events.mjs` |
| Notes | API key required for live requests. No key is committed. Synthetic fixtures are not government data. |
