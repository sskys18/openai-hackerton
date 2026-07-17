# Culprit - OpenAI Build Week Submission

**Track:** Developer Tools
**Deadline:** Tue July 21, 2026, 5:00 PM PT
**Hackathon:** OpenAI Build Week (openai.devpost.com)

## Elevator pitch (for the form)

> Culprit is a Codex plugin that turns a failing test or bug report into a
> root-caused fix: it reproduces the failure, drives `git bisect` to prove the exact
> offending commit, explains the root cause with GPT-5.6, and proposes a validated
> fix - all from inside a Codex session.

## Devpost submission checklist

- [ ] **Working project** built with Codex + GPT-5.6 (core loop runs end to end).
- [ ] **Category selected:** Developer Tools.
- [ ] **Text description** written (features + how it works). Draft: `README.md`.
- [ ] **Demo video** < 3 min, public on YouTube, with audio covering *what we built*
      AND *how we used Codex and GPT-5.6*. Script in "Demo script" below.
- [ ] **Public code repo** (or private + shared with `testing@devpost.com` and
      `build-week-event@openai.com`).
- [ ] **README** with setup, sample data, run instructions - and where Codex
      accelerated the work / key decisions / how GPT-5.6 + Codex were used.
- [ ] **Plugin/dev-tool extras:** install instructions + a way for judges to test
      without rebuilding (the `make-demo.sh` fixture + `npx`/bun one-liner).
- [ ] **/feedback Codex Session ID** for the thread where core functionality was built.
- [ ] All materials in English.

## Judging criteria - how we target each (equally weighted)

| Criterion | Our angle |
| --- | --- |
| Technological Implementation | Real MCP server Codex binds to; deterministic bisect core + GPT-5.6 reasoning; judges run it on their own repo. |
| Design | One coherent `find regression -> explain -> fix` flow with safety caps, not four loose scripts. |
| Potential Impact | "Which commit broke this and why" is universal dev pain; automates both the bisect *and* the explanation. |
| Quality of the Idea | Determinism (proven culprit) + LLM reasoning (root cause + fix); the proof keeps the model honest. |

## Demo script (target < 3:00)

1. (0:00-0:20) Hook: "A test that passed last week is red. Normally you'd bisect by
   hand. Watch Codex do it with Culprit."
2. (0:20-0:40) Run `./test/fixtures/make-demo.sh` - show a repo with a hidden
   regression buried under later commits.
3. (0:40-1:40) In Codex: "find what broke `node test.mjs` and propose a fix."
   Codex calls `reproduce_failure` -> `find_regression` (bisect nails the commit) ->
   `explain_commit` (GPT-5.6 names the off-by-one) -> `propose_fix` (one-line diff).
4. (1:40-2:20) Apply the proposed diff, rerun, green. Emphasize: culprit was
   *proven* by bisect, explanation + fix by GPT-5.6.
5. (2:20-2:50) Say explicitly how Codex built this and how GPT-5.6 powers the
   reasoning steps. Show the repo/README.

## How Codex + GPT-5.6 were used (README write-up seed)

- **Codex** scaffolded the MCP server, the bisect driver, and the demo fixture;
  iterated the tool contracts; wrote and ran the fixture verification.
- **GPT-5.6** runs at runtime inside `explain_commit` (root-cause narrative) and
  `propose_fix` (candidate unified diff), reasoning over a diff that bisect already
  proved is the culprit.
- Codex `/feedback` session ID: **TODO - capture from the core-build thread.**

## Pre-submission verification (evidence)

- [x] Demo fixture builds and plants a real regression (`make-demo.sh`).
- [x] `git bisect run node test.mjs` identifies the planted culprit and resets clean.
      (Verified: culprit = "perf: tighten loop bound".)
- [x] MCP server boots and lists all four tools over stdio with real JSON schemas.
- [x] End-to-end `tools/call find_regression` on the fixture returns the culprit + resets clean.
- [x] Unit tests: bisect pinpoint, clean-tree reset, applyCheck accept/reject (3 pass).
- [ ] GPT-5.6 reasoning tools (explain_commit / propose_fix) - needs OPENAI_API_KEY (M3).
- [ ] Full run through a live Codex session against the fixture.

## Links (fill before submitting)

- Repo URL: TODO
- Demo video URL: TODO
- /feedback Codex Session ID: TODO
