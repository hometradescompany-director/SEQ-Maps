# Corridor absence receipt — 2026-10-07

Zero observed flow produces a null weighted travel time; zero merge attempts produces a null merge success ratio. JavaScript subtraction previously coerced those nulls into zero, manufacturing a numeric comparison.

Travel-time and merge-success deltas now remain null when either operand lacks observations. Numeric comparisons and causal standing (`not-established`) remain unchanged. A regression covers missing reference, missing candidate and both missing. Before the fix it returned 22.742331288343557 instead of null; after the fix it passes.

Validation: 9 branch tests, 15 tests on the combined current-main tree including QLDTraffic/source-registry checks. Independent read-only review found no critical or important scoped issues. No live observations, causal conclusion or enforcement authority are introduced.
