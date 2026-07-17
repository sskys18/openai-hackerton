// Safe git wrappers. Every bisect run is bracketed so we ALWAYS reset back to
// the original HEAD, even on error. Nothing here rewrites history or pushes.

import type { ExecResult } from "./exec.ts";

export interface BisectStep {
  sha: string;
  verdict: "good" | "bad" | "skip";
}

export interface Culprit {
  culpritSha: string;
  subject: string;
  author: string;
  date: string;
  steps: BisectStep[];
}

/** TODO(M1): `git rev-parse --is-inside-work-tree` + dirty check. */
export async function assertCleanRepo(repo: string, allowDirty = false): Promise<void> {
  void repo;
  void allowDirty;
  throw new Error("not implemented: git.assertCleanRepo (M1)");
}

/** TODO(M1): current HEAD ref, restored in the bisect finally block. */
export async function currentRef(repo: string): Promise<string> {
  void repo;
  throw new Error("not implemented: git.currentRef (M1)");
}

/**
 * Drive `git bisect start <bad> <good>` then `git bisect run sh -c "<predicate>"`,
 * parse "<sha> is the first bad commit", and ALWAYS `git bisect reset` after.
 * TODO(M2).
 */
export async function bisectRun(args: {
  repo: string;
  predicate: string;
  goodRef: string;
  badRef: string;
  maxSteps: number;
}): Promise<Culprit> {
  void args;
  throw new Error("not implemented: git.bisectRun (M2)");
}

/** TODO(M2): `git show --patch --stat <sha>`. */
export async function showCommit(repo: string, sha: string): Promise<string> {
  void repo;
  void sha;
  throw new Error("not implemented: git.showCommit (M2)");
}

/** TODO(M3): validate a candidate patch applies without touching the tree. */
export async function applyCheck(repo: string, diff: string): Promise<ExecResult> {
  void repo;
  void diff;
  throw new Error("not implemented: git.applyCheck (M3)");
}
