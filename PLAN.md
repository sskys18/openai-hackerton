# Culprit - Build Plan

> OpenAI Build Week submission. Track: **Developer Tools**.
> Built with Codex + GPT-5.6.

## One-liner

A Codex plugin (MCP server) that turns a failing test or bug report into a
root-caused fix: it reproduces the failure, drives `git bisect` to find the exact
offending commit, explains the root cause with GPT-5.6, and proposes a fix as a
patch/PR - all from inside a Codex session.

## Why it fits the track + judging criteria

- **Technological Implementation** - ships as a real MCP server Codex connects to;
  the whole loop is orchestrated by Codex and the analysis/fix steps call GPT-5.6.
  Judges can install it against their own repo and watch it work.
- **Design** - one coherent flow (`find_regression`) that a developer actually
  runs end to end, not four disconnected scripts. Sensible defaults, safety caps.
- **Potential Impact** - "which commit broke this and why" is a universal, painful,
  time-sink task. Bisect is powerful but tedious to script by hand; this automates
  the driving AND the explanation.
- **Quality of the Idea** - combines deterministic `git bisect` (trustworthy commit
  identification) with LLM reasoning (root-cause narrative + candidate fix). The
  determinism keeps the LLM honest: the culprit commit is proven, not guessed.

## Architecture

```
Codex session
   │  (MCP stdio)
   ▼
Culprit MCP server (src/server.ts)
   ├─ tool: reproduce_failure   -> run the failing command, capture output/exit
   ├─ tool: find_regression     -> git bisect run <predicate>, return culprit sha
   ├─ tool: explain_commit      -> diff + failure log -> GPT-5.6 root-cause report
   └─ tool: propose_fix         -> GPT-5.6 candidate patch (unified diff) + rationale
```

Shared helpers:
- `src/git.ts`   - safe git exec wrappers (bisect start/good/bad/reset, diff, log).
- `src/exec.ts`  - sandboxed command runner with timeout + output capture.
- `src/llm.ts`   - GPT-5.6 client (OpenAI SDK), prompt builders, JSON-safe parsing.

## Tool contracts (MVP)

### `reproduce_failure`
- in: `{ repo: string, cmd: string, timeoutSec?: number }`
- out: `{ passed: boolean, exitCode: number, stdout: string, stderr: string }`
- purpose: confirm the failure is real and give us the predicate command.

### `find_regression`
- in: `{ repo: string, cmd: string, goodRef: string, badRef?: string, maxSteps?: number }`
- out: `{ culpritSha: string, subject: string, author: string, date: string, steps: BisectStep[] }`
- impl: `git bisect start <bad> <good>` then `git bisect run sh -c "<cmd>"`, parse
  the "is the first bad commit" line. Always `git bisect reset` in a finally block.
- safety: refuse if working tree is dirty; cap steps; restore original ref.

### `explain_commit`
- in: `{ repo: string, sha: string, failureLog: string }`
- out: `{ summary: string, rootCause: string, riskyHunks: string[] }`
- impl: `git show <sha>` diff + failure log -> GPT-5.6 -> structured report.

### `propose_fix`
- in: `{ repo: string, sha: string, rootCause: string }`
- out: `{ diff: string, rationale: string, testSuggestion: string }`
- impl: GPT-5.6 returns a minimal unified diff; we validate it applies with
  `git apply --check` before returning. Never auto-commits; developer/Codex decides.

## Safety rules (non-negotiable)

1. Never mutate history or push. Only local bisect (auto-reset) + patch generation.
2. Refuse on a dirty working tree unless `--allow-dirty` is explicit.
3. Always `git bisect reset` back to the original HEAD, even on error.
4. Hard cap on bisect steps and per-command timeout.
5. `propose_fix` output is a proposal only - applying it is a separate human step.

## Milestones

- [x] M0 Setup: repo, scaffolding, docs, demo fixture, submission checklist.
- [x] M1 exec.ts + git.ts helpers with tests. (3 tests pass)
- [x] M2 reproduce_failure + find_regression (deterministic core, GPT-free).
- [ ] M3 llm.ts + explain_commit + propose_fix (GPT-5.6). NEXT
- [x] M4 MCP wiring (real JSON schemas), end-to-end tools/call on fixture verified.
- [ ] M5 README polish, 3-min demo script, record video, submit.

## Demo (the money shot for the video)

1. `test/fixtures/regression-demo` - a tiny repo with ~12 commits; one mid-history
   commit breaks a unit test.
2. In Codex: "this test is failing, find what broke it." Codex calls Culprit.
3. Culprit reproduces -> bisects -> names the culprit commit -> GPT-5.6 explains
   the off-by-one -> proposes the one-line fix. Under a minute, on camera.

## Open decisions

- Package + publish as `npx culprit` for zero-install judge testing? (leaning yes)
- Ship the fixture as a tarball so the planted `.git` history survives clone.
