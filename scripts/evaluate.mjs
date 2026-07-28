import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
const requiredManualArgs = ["architecture", "review-minutes", "fix-lines", "agent-minutes", "cost-usd"];
const automatedOnly = args["automated-only"] === true;

if (!args.model || !args["run-id"]) {
  fail("Usage: npm run evaluate -- --model <name> --run-id <id> [manual scoring options]");
}

if (!automatedOnly) {
  const missing = requiredManualArgs.filter((name) => args[name] === undefined);
  if (missing.length > 0) fail(`Missing manual scoring options: ${missing.join(", ")}`);
}

const root = process.cwd();
const outputDir = resolve(root, String(args["output-dir"] ?? "results/runs"));
const reportPath = resolve(root, ".playwright-report.json");
const config = JSON.parse(readFileSync(resolve(root, "benchmark/scoring-config.json"), "utf8"));
mkdirSync(outputDir, { recursive: true });
rmSync(reportPath, { force: true });

const checks = [
  runCheck("lint", ["run", "lint"]),
  runCheck("typecheck", ["run", "typecheck"]),
  runCheck("unit", ["run", "test:unit"]),
  runCheck("build", ["run", "build"]),
];
const gatePassed = checks.every((check) => check.passed);

const e2e = spawnSync("npm", ["run", "test:e2e"], {
  cwd: root,
  encoding: "utf8",
  env: { ...process.env, BENCHMARK_JSON_REPORT: reportPath },
});

const tests = readPlaywrightResults(reportPath);
const automatic = scoreTests(tests);
const manual = automatedOnly ? null : scoreManual(args, config);
const rawTotal = automatic.total + (manual?.total ?? 0);
const finalScore = gatePassed ? rawTotal : Math.min(rawTotal, 40);
const result = {
  schemaVersion: 1,
  runId: String(args["run-id"]),
  model: String(args.model),
  agent: args.agent ? String(args.agent) : null,
  promptCorrections: nonNegativeNumber(args["prompt-corrections"] ?? 0, "prompt-corrections"),
  createdAt: new Date().toISOString(),
  git: getGitMetadata(),
  gatePassed,
  checks,
  e2eProcessPassed: e2e.status === 0,
  automatic,
  manual,
  score: finalScore,
  scoreOutOf: automatedOnly ? 65 : 100,
  fullTaskSuccess: gatePassed && automatic.total === 65,
};

const baseName = sanitize(result.runId);
const jsonPath = resolve(outputDir, `${baseName}.json`);
const markdownPath = resolve(outputDir, `${baseName}.md`);
writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`);
writeFileSync(markdownPath, renderMarkdown(result));
rmSync(reportPath, { force: true });

console.log(renderSummary(result));
console.log(`JSON: ${jsonPath}`);
console.log(`Markdown: ${markdownPath}`);

function runCheck(name, npmArgs) {
  const result = spawnSync("npm", npmArgs, { cwd: root, encoding: "utf8" });
  return {
    name,
    passed: result.status === 0,
    exitCode: result.status,
  };
}

function readPlaywrightResults(path) {
  try {
    const report = JSON.parse(readFileSync(path, "utf8"));
    const specs = [];
    walkSuites(report.suites ?? [], specs);
    return specs;
  } catch {
    return [];
  }
}

function walkSuites(suites, specs) {
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      const passed = (spec.tests ?? []).some((test) =>
        (test.results ?? []).some((result) => result.status === "passed"),
      );
      specs.push({ title: spec.title, passed });
    }
    walkSuites(suite.suites ?? [], specs);
  }
}

function scoreTests(tests) {
  const areas = {
    functional: { earned: 0, possible: 35, prefix: "F" },
    regression: { earned: 0, possible: 20, prefix: "R" },
    quality: { earned: 0, possible: 10, prefix: "Q" },
  };

  for (const test of tests) {
    const match = test.title.match(/^\[([FRQ])(\d+)\]/);
    if (!match) continue;
    const area = Object.values(areas).find((candidate) => candidate.prefix === match[1]);
    if (area && test.passed) area.earned += Number(match[2]);
  }

  return {
    functional: areas.functional.earned,
    regression: areas.regression.earned,
    quality: areas.quality.earned,
    total: areas.functional.earned + areas.regression.earned + areas.quality.earned,
    tests,
  };
}

function scoreManual(values, scoringConfig) {
  const architecture = boundedNumber(values.architecture, 0, 15, "architecture");
  const reviewMinutes = nonNegativeNumber(values["review-minutes"], "review-minutes");
  const fixLines = nonNegativeNumber(values["fix-lines"], "fix-lines");
  const agentMinutes = nonNegativeNumber(values["agent-minutes"], "agent-minutes");
  const costUsd = nonNegativeNumber(values["cost-usd"], "cost-usd");
  const reviewScore = descendingScore(reviewMinutes, scoringConfig.reviewMinutes, [6, 5, 3, 1, 0]);
  const fixScore = descendingScore(fixLines, scoringConfig.manualFixLines, [4, 3, 2, 1, 0]);
  const timeScore = descendingScore(agentMinutes, scoringConfig.agentMinutes, [5, 4, 2, 1, 0]);
  const costScore = descendingScore(costUsd, scoringConfig.costUsd, [5, 4, 2, 1, 0]);

  return {
    architecture,
    humanEffort: reviewScore + fixScore,
    efficiency: timeScore + costScore,
    inputs: { reviewMinutes, fixLines, agentMinutes, costUsd },
    total: architecture + reviewScore + fixScore + timeScore + costScore,
  };
}

function descendingScore(value, thresholds, scores) {
  const index = thresholds.findIndex((threshold) => value <= threshold);
  return scores[index === -1 ? scores.length - 1 : index];
}

function getGitMetadata() {
  const revision = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
  const branch = spawnSync("git", ["branch", "--show-current"], { encoding: "utf8" });
  return {
    revision: revision.status === 0 ? revision.stdout.trim() : null,
    branch: branch.status === 0 ? branch.stdout.trim() : null,
  };
}

function renderSummary(result) {
  const status = result.fullTaskSuccess ? "PASS" : "INCOMPLETE";
  return [
    "",
    `Benchmark: ${status}`,
    `Model: ${result.model}`,
    `Automatic: ${result.automatic.total}/65`,
    `Functional: ${result.automatic.functional}/35`,
    `Regression: ${result.automatic.regression}/20`,
    `Quality: ${result.automatic.quality}/10`,
    result.manual ? `Manual: ${result.manual.total}/35` : "Manual: not scored",
    `Final: ${result.score}/${result.scoreOutOf}`,
    `Base gates: ${result.gatePassed ? "passed" : "failed"}`,
    "",
  ].join("\n");
}

function renderMarkdown(result) {
  const rows = result.automatic.tests
    .map((test) => `| ${test.title} | ${test.passed ? "PASS" : "FAIL"} |`)
    .join("\n");
  return `# Benchmark Result: ${result.runId}\n\n` +
    `- Model: ${result.model}\n` +
    `- Agent: ${result.agent ?? "not recorded"}\n` +
    `- Corrective prompts: ${result.promptCorrections}\n` +
    `- Created: ${result.createdAt}\n` +
    `- Git revision: ${result.git.revision ?? "unknown"}\n` +
    `- Full task success: ${result.fullTaskSuccess ? "yes" : "no"}\n` +
    `- Score: **${result.score}/${result.scoreOutOf}**\n\n` +
    `| Area | Score |\n| --- | ---: |\n` +
    `| Functional | ${result.automatic.functional}/35 |\n` +
    `| Regression | ${result.automatic.regression}/20 |\n` +
    `| Resilience and accessibility | ${result.automatic.quality}/10 |\n` +
    `| Human review | ${result.manual ? `${result.manual.total}/35` : "not scored"} |\n\n` +
    `## Test Details\n\n| Test | Result |\n| --- | --- |\n${rows}\n`;
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith("--")) parsed[key] = true;
    else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

function boundedNumber(value, min, max, name) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    fail(`${name} must be between ${min} and ${max}`);
  }
  return number;
}

function nonNegativeNumber(value, name) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) fail(`${name} must be a non-negative number`);
  return number;
}

function sanitize(value) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
