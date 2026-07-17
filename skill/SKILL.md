---
name: culprit
description: Find the commit that introduced a regression and propose a fix. Use when a test/build that used to pass now fails, or a bug appeared "sometime recently".
---

# Culprit - regression detective

When the user reports that something that used to work is now broken, drive the
Culprit MCP tools in this order. Do not skip reproduction; the whole value is that
the culprit is *proven*, not guessed.

## Playbook

1. **Reproduce.** Call `reproduce_failure` with the failing command. If it passes,
   stop and tell the user it doesn't reproduce - ask for the exact command/ref.
2. **Find a good ref.** Ask the user for a commit/date where it worked, or probe a
   few older refs with `reproduce_failure` until one passes. That is `goodRef`.
3. **Bisect.** Call `find_regression` with the reproducing command as the predicate,
   `goodRef`, and `badRef` (default HEAD). Report the culprit SHA + subject.
4. **Explain.** Call `explain_commit` with the culprit SHA and the failure log.
   Summarize the root cause in one or two sentences for the user.
5. **Propose.** Call `propose_fix`. Show the diff. Do NOT apply it automatically -
   let the user (or a follow-up Codex step) decide.

## Guardrails

- Never suggest rewriting git history, force-pushing, or committing without asking.
- If the working tree is dirty, tell the user to commit/stash first (Culprit
  refuses on a dirty tree by default).
- A bisect can take several steps on a big repo; report progress, don't stall.
- The predicate command must exit 0 when good and non-zero when broken. If a test
  runner returns 0 even on failure, wrap it so the exit code reflects the failure.
