# Benchmark Runs

`npm run evaluate` writes one JSON file and one Markdown report per run here. Keep at least three independent runs per model and compare their medians with:

```bash
npm run compare -- results/runs/*.json
```

Commit result artifacts only when the model version, agent version, base commit, prompt corrections, and scoring inputs are complete.
