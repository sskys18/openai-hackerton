import { test, expect, beforeAll, afterAll } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "../src/exec.ts";
import { bisectRun, assertCleanRepo, applyCheck } from "../src/git.ts";

let repo: string;

beforeAll(async () => {
  repo = mkdtempSync(join(tmpdir(), "culprit-demo-"));
  const gen = await spawn(["bash", "test/fixtures/make-demo.sh", repo], { cwd: process.cwd() });
  if (gen.exitCode !== 0) throw new Error("fixture generation failed:\n" + gen.stderr);
});

afterAll(() => {
  if (repo) rmSync(repo, { recursive: true, force: true });
});

test("bisectRun pinpoints the planted regression commit", async () => {
  const good = (await spawn(["git", "rev-parse", "HEAD~9"], { cwd: repo })).stdout.trim();
  const result = await bisectRun({
    repo,
    predicate: "node test.mjs",
    goodRef: good,
    badRef: "HEAD",
  });

  expect(result.subject).toBe("perf: tighten loop bound");
  expect(result.culpritSha).toMatch(/^[0-9a-f]{40}$/);
  expect(result.steps.length).toBeGreaterThan(0);
});

test("bisectRun resets back to the original branch", async () => {
  const branch = (await spawn(["git", "rev-parse", "--abbrev-ref", "HEAD"], { cwd: repo })).stdout.trim();
  expect(branch).toBe("main");
  // A dirty-tree guard should also hold on a clean fixture.
  await expect(assertCleanRepo(repo)).resolves.toBeUndefined();
});

test("applyCheck accepts the correct fix and rejects garbage", async () => {
  const fix = [
    "diff --git a/sum.mjs b/sum.mjs",
    "index 0000000..1111111 100644",
    "--- a/sum.mjs",
    "+++ b/sum.mjs",
    "@@ -2,5 +2,5 @@ export function sumTo(n) {",
    " export function sumTo(n) {",
    "   let total = 0;",
    "-  for (let i = 1; i < n; i++) total += i; // BUG: should be i <= n",
    "+  for (let i = 1; i <= n; i++) total += i;",
    "   return total;",
    " }",
    "",
  ].join("\n");
  // On the broken HEAD, the corrected patch should apply.
  const ok = await applyCheck(repo, fix);
  expect(ok.exitCode).toBe(0);

  const garbage = await applyCheck(repo, "not a real diff\n");
  expect(garbage.exitCode).not.toBe(0);
});
