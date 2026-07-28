# Web AI Coding Benchmark

A small, reproducible personal benchmark for choosing coding models by real development utility instead of trend or leaderboard hype.

The benchmark starts from an existing React and TypeScript product catalog. A model must understand the repository, add a search/filter/pagination workflow, preserve existing behavior, and pass browser and accessibility checks. Human review time and API cost are recorded alongside automated correctness.

## Why this exists

Greenfield code generation benchmarks are useful, but most day-to-day development extends code that already exists. A useful coding model must do more than produce plausible code:

- preserve existing behavior;
- follow repository conventions;
- handle browser state, errors, responsiveness, and accessibility;
- reduce review and rework, not only typing time;
- produce changes the developer can understand and own.

This repository turns those principles into a fixed 100-point decision rule.

## Score

| Area | Points | Evaluation |
| --- | ---: | --- |
| Functional correctness | 35 | Playwright |
| Regression safety | 20 | Playwright and browser errors |
| Resilience and accessibility | 10 | Playwright, keyboard flow, axe |
| Repository and architecture fit | 15 | Blind human review |
| Human review and repair effort | 10 | Recorded active minutes and fixed lines |
| Agent time and API cost | 10 | Fixed thresholds |

Build, typecheck, lint, or unit-test failure caps the result at 40 points. See [the full rubric](benchmark/rubric.md).

## The challenge

The `main` branch is intentionally the incomplete base fixture. It builds and passes its existing unit tests, but it does not yet implement the benchmark feature.

Give the model only the repository and [benchmark/task.md](benchmark/task.md). It must add:

- debounced search;
- composable category filtering;
- six-item pagination;
- URL state and browser history support;
- loading and empty recovery states;
- responsive and keyboard-accessible behavior.

The existing details dialog and product data must remain intact.

## Run it

Requirements: Node.js 22.13 or later in the 22.x line, or Node.js 24 or later.

```bash
npm ci
npx playwright install chromium
npm run verify:base
```

Create a fresh branch from the same base commit for every run:

```bash
git switch -c runs/model-name-1
```

Start a timer, provide `benchmark/task.md` to the coding agent, and record prompt corrections. After the agent finishes, run the full evaluator:

```bash
npm run evaluate -- \
  --model "provider/model-version" \
  --agent "agent/version" \
  --run-id "model-version-run-1" \
  --prompt-corrections 0 \
  --architecture 12 \
  --review-minutes 8 \
  --fix-lines 3 \
  --agent-minutes 18 \
  --cost-usd 1.20
```

For an automated-only smoke run:

```bash
npm run evaluate -- \
  --model "baseline" \
  --run-id "baseline-smoke" \
  --automated-only \
  --output-dir /tmp/web-ai-benchmark
```

The baseline is expected to score regression and accessibility points while failing the unimplemented feature tests.

## Compare models

Run each candidate three times from the same base commit. Then compare medians:

```bash
npm run compare -- results/runs/*.json
```

Default personal switching rule:

- require at least 80% full-task success across the wider personal task suite;
- switch when the median score improves by at least 8 points;
- when scores are close, require at least 20% less human active time with no regression loss;
- treat a difference below 5 points as no meaningful difference.

These thresholds are a personal operating rule, not a universal scientific claim. Freeze `benchmark/scoring-config.json` before comparing models.

## Fair-use protocol

1. Use the exact same base commit, task text, environment, and budget.
2. Record the full model and agent version, date, cost, and corrective prompts.
3. Use three independent runs and report the median, not the best attempt.
4. Score architecture fit before revealing the model identity to the reviewer.
5. Keep infrastructure failures separate from model failures.
6. Do not edit tests or fixture data during a run.

The tests are public for transparency, so this is a personal calibration benchmark rather than a tamper-proof public leaderboard. For stronger private evaluation, keep a second set of acceptance tests outside the agent workspace.

## Interview framing

The repository supports a concise answer:

> I do not switch coding tools because a new model is trending. I run the same existing-repository task three times, measure correctness, regressions, architecture fit, review effort, time, and cost, and switch only when the median improvement crosses a threshold I fixed in advance.

A Korean interview version is available in [docs/INTERVIEW-ANSWER.ko.md](docs/INTERVIEW-ANSWER.ko.md).

## License

MIT
