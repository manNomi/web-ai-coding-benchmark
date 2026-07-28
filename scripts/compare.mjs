import { readFileSync } from "node:fs";

const paths = process.argv.slice(2);
if (paths.length === 0) {
  console.error("Usage: npm run compare -- results/runs/*.json");
  process.exit(1);
}

const runs = paths.map((path) => JSON.parse(readFileSync(path, "utf8")));
const grouped = Object.groupBy(runs, (run) => run.model);
const summaries = Object.entries(grouped).map(([model, modelRuns]) => ({
  model,
  runs: modelRuns.length,
  successRate: modelRuns.filter((run) => run.fullTaskSuccess).length / modelRuns.length,
  medianScore: median(modelRuns.map((run) => run.score)),
  medianReviewMinutes: median(
    modelRuns.flatMap((run) => run.manual ? [run.manual.inputs.reviewMinutes] : []),
  ),
  medianCostUsd: median(
    modelRuns.flatMap((run) => run.manual ? [run.manual.inputs.costUsd] : []),
  ),
}));

summaries.sort((left, right) => right.medianScore - left.medianScore);
console.log("| Model | Runs | Full success | Median score | Median review | Median cost |");
console.log("| --- | ---: | ---: | ---: | ---: | ---: |");
for (const summary of summaries) {
  console.log(
    `| ${summary.model} | ${summary.runs} | ${(summary.successRate * 100).toFixed(0)}% | ` +
    `${format(summary.medianScore)} | ${format(summary.medianReviewMinutes, " min")} | ` +
    `${format(summary.medianCostUsd, " USD")} |`,
  );
}

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function format(value, suffix = "") {
  return value === null ? "n/a" : `${Number(value).toFixed(1)}${suffix}`;
}
