# POS Systems in SEQ Maps

SEQ Maps follows the shared POS Systems doctrine:

https://github.com/hometradescompany-director/Swarm-Home-Hub/blob/main/README.POS.md

Here, **POS** means **Piece of Shit System**: an intentionally blunt reminder that transport data, public APIs, timestamps, sensors, routing providers and rendered maps will eventually disagree.

## Local application

SEQ Maps therefore treats:

- source feeds as evidence, not unquestioned truth;
- map surfaces as projections, not canonical state;
- `valid_at`, `known_at` and `ingested_at` as distinct when the source permits it;
- missing or contradictory observations as typed states rather than silent cleanup;
- providers as adapters rather than architecture;
- small end-to-end corridor proofs as stronger evidence than large feature counts.

"Welcome to the Shit Show" is not a literal boot requirement. It is the production posture: the system should remain explainable when the road network, data provider and user-facing view do not line up neatly.

SEQ Maps should earn trust by preserving the path from source observation to rendered outcome.
