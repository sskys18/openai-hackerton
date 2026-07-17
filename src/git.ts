// Safe git wrappers. Every bisect run is bracketed so we ALWAYS reset back to
// the original HEAD, even on error. Nothing here rewrites history or pushes.

import { spawn, run, type ExecResult } from "./exec.ts";

export interface BisectStep {
  sha: string;
  verdict: "good" | "bad";
}

export interface Culprit {
  culpritSha: string;
  subject: string;
  author: string;
  date: string;
  steps: BisectStep[];
}

const MAX_STEPS = Number(process.env.CULPRIT_MAX_BISECT_STEPS ?? 25);

/** Run a git subcommand (argv, no shell) in `repo`. Throws on non-zero exit. */
async function git(repo: string, args: string[]): Promise<ExecResult> {
  const res = await spawn(["git", ...args], { cwd: repo });
  if (res.exitCode !== 0) {
    throw new Error(`git ${args.join(" ")} failed (${res.exitCode}):\n${res.stderr || res.stdout}`);
  }
  return res;
}

/** Refuse to touch a repo with uncommitted changes unless explicitly allowed. */
export async function assertCleanRepo(repo: string, allowDirty = false): Promise<void> {
  const inside = await spawn(["git", "rev-parse", "--is-inside-work-tree"], { cwd: repo });
  if (inside.exitCode !== 0 || inside.stdout.trim() !== "true") {
    throw new Error(`not a git work tree: ${repo}`);
  }
  if (allowDirty) return;
  const status = await git(repo, ["status", "--porcelain"]);
  if (status.stdout.trim() !== "") {
    throw new Error("working tree is dirty; commit or stash first (or pass allowDirty)");
  }
}

/** The symbolic ref (branch) or sha we started on, restored after bisect. */
export async function currentRef(repo: string): Promise<string> {
  const sym = await spawn(["git", "symbolic-ref", "--short", "-q", "HEAD"], { cwd: repo });
  if (sym.exitCode === 0 && sym.stdout.trim()) return sym.stdout.trim();
  return (await git(repo, ["rev-parse", "HEAD"])).stdout.trim();
}

const FIRST_BAD = /([0-9a-f]{40}) is the first bad commit/;

/**
 * Drive `git bisect` manually between a known-good and bad ref, running the
 * predicate at each step. Records every step, and ALWAYS resets the bisect and
 * restores the original ref in the finally block.
 */
export async function bisectRun(args: {
  repo: string;
  predicate: string;
  goodRef: string;
  badRef?: string;
  maxSteps?: number;
  timeoutSec?: number;
  allowDirty?: boolean;
}): Promise<Culprit> {
  const { repo, predicate, goodRef } = args;
  const badRef = args.badRef ?? "HEAD";
  const maxSteps = args.maxSteps ?? MAX_STEPS;

  await assertCleanRepo(repo, args.allowDirty ?? false);
  const original = await currentRef(repo);

  try {
    await git(repo, ["bisect", "start"]);
    await git(repo, ["bisect", "bad", badRef]);
    let out = await git(repo, ["bisect", "good", goodRef]);

    const steps: BisectStep[] = [];
    let culpritSha: string | null = null;

    for (let i = 0; i <= maxSteps; i++) {
      const hit = (out.stdout + out.stderr).match(FIRST_BAD);
      if (hit) {
        culpritSha = hit[1] ?? null;
        break;
      }
      const cur = (await git(repo, ["rev-parse", "HEAD"])).stdout.trim();
      const res = await run(predicate, { cwd: repo, timeoutSec: args.timeoutSec });
      const verdict: BisectStep["verdict"] = res.exitCode === 0 ? "good" : "bad";
      steps.push({ sha: cur, verdict });
      out = await git(repo, ["bisect", verdict]);
    }

    if (!culpritSha) {
      throw new Error(
        `bisect did not converge within ${maxSteps} steps; check the good/bad refs and that the predicate exits 0 only when good`,
      );
    }

    const meta = await git(repo, ["show", "-s", "--format=%H%n%s%n%an%n%aI", culpritSha]);
    const [fullSha, subject, author, date] = meta.stdout.trim().split("\n");
    return {
      culpritSha: fullSha ?? culpritSha,
      subject: subject ?? "",
      author: author ?? "",
      date: date ?? "",
      steps,
    };
  } finally {
    await spawn(["git", "bisect", "reset"], { cwd: repo }).catch(() => {});
    await spawn(["git", "checkout", original], { cwd: repo }).catch(() => {});
  }
}

/** Full patch + stat for a commit, fed to GPT-5.6 for root-cause analysis. */
export async function showCommit(repo: string, sha: string): Promise<string> {
  return (await git(repo, ["show", "--patch", "--stat", sha])).stdout;
}

/** Validate a candidate patch applies cleanly without touching the work tree. */
export async function applyCheck(repo: string, diff: string): Promise<ExecResult> {
  const proc = Bun.spawn(["git", "apply", "--check", "-"], {
    cwd: repo,
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });
  proc.stdin.write(diff);
  await proc.stdin.end();
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;
  return { exitCode, stdout, stderr, timedOut: false };
}
