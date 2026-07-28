# Scoring Rubric

The benchmark uses 100 points. The evaluator automates 65 points; a human reviewer records the remaining 35 points.

## Automated score: 65

| Area | Points | Evidence |
| --- | ---: | --- |
| Functional correctness | 35 | Search, category, composition, pagination, URL persistence, browser history |
| Regression safety | 20 | Original catalog, details dialog, mobile overflow, console errors |
| Resilience and accessibility | 10 | Empty recovery, loading status, keyboard flow, axe |

Build, typecheck, lint, or unit-test failure caps the final score at 40.

## Human score: 35

### Repository and architecture fit: 15

Score this before looking at the model name.

| Score | Description |
| ---: | --- |
| 13-15 | Reuses existing boundaries, adds focused abstractions, and leaves unrelated code untouched |
| 9-12 | Correct overall with small duplication or awkward ownership |
| 5-8 | Works but introduces avoidable coupling, duplication, or broad edits |
| 1-4 | Replaces established structure or is difficult to maintain |
| 0 | Destructive or cannot be responsibly reviewed |

### Human effort: 10

The evaluator derives this from active review minutes and manually fixed lines.

- Review: up to 6 points
- Manual fixes: up to 4 points

Waiting for the model does not count as human active time. Reading, prompting, reviewing, and manual editing do count.

### Time and API cost: 10

The evaluator derives this from agent wall time and API cost using the fixed thresholds in `benchmark/scoring-config.json`. Change the thresholds before a comparison series, never between models in the same series.

## Default switching rule

Evaluate each model three times from the same base commit and compare medians.

- Full-task success rate must be at least 80% across the wider personal task suite.
- Switch when the median total score improves by at least 8 points.
- If scores differ by fewer than 8 points, switch only when human active time falls by at least 20% without lower regression safety.
- Treat a difference below 5 points as no meaningful difference.

This is a personal decision rule, not a claim of statistical significance.
