// Tool registry: schema + handler for each MCP tool. The deterministic tools
// (reproduce_failure, find_regression) are implemented; the GPT-5.6 reasoning
// tools (explain_commit, propose_fix) land in M3. See PLAN.md.

import { z } from "zod";
import { run } from "../exec.ts";
import { bisectRun, showCommit, applyCheck } from "../git.ts";
import { explainCommit, proposeFix } from "../llm.ts";

export interface ToolDef {
  name: string;
  description: string;
  input: z.ZodTypeAny;
  handler: (args: any) => Promise<unknown>;
}

export const tools: ToolDef[] = [
  {
    name: "reproduce_failure",
    description:
      "Run a command in a repo and report exit code + output, to confirm a failure is real before bisecting.",
    input: z.object({
      repo: z.string().describe("Absolute path to the git repo."),
      cmd: z.string().describe("Command that reproduces the failure, e.g. 'bun test'."),
      timeoutSec: z.number().int().positive().optional(),
    }),
    handler: async (a) => {
      const res = await run(a.cmd, { cwd: a.repo, timeoutSec: a.timeoutSec });
      return {
        passed: res.exitCode === 0,
        exitCode: res.exitCode,
        timedOut: res.timedOut,
        stdout: res.stdout,
        stderr: res.stderr,
      };
    },
  },
  {
    name: "find_regression",
    description:
      "Drive `git bisect` between a known-good ref and a bad ref to find the exact commit that introduced a regression. Always resets the repo afterward.",
    input: z.object({
      repo: z.string(),
      cmd: z.string().describe("Predicate: exits 0 when good, non-zero when broken."),
      goodRef: z.string().describe("A ref/sha where the command passed."),
      badRef: z.string().optional().describe("Defaults to HEAD."),
      maxSteps: z.number().int().positive().optional(),
      timeoutSec: z.number().int().positive().optional(),
      allowDirty: z.boolean().optional(),
    }),
    handler: (a) =>
      bisectRun({
        repo: a.repo,
        predicate: a.cmd,
        goodRef: a.goodRef,
        badRef: a.badRef,
        maxSteps: a.maxSteps,
        timeoutSec: a.timeoutSec,
        allowDirty: a.allowDirty,
      }),
  },
  {
    name: "explain_commit",
    description:
      "Use GPT-5.6 to explain the root cause of a regression from the culprit commit diff and the failure log.",
    input: z.object({
      repo: z.string(),
      sha: z.string(),
      failureLog: z.string(),
    }),
    handler: async (a) => {
      const diff = await showCommit(a.repo, a.sha);
      return explainCommit({ diff, failureLog: a.failureLog });
    },
  },
  {
    name: "propose_fix",
    description:
      "Use GPT-5.6 to propose a minimal unified-diff fix for the root cause, validated with `git apply --check`. Never auto-applied.",
    input: z.object({
      repo: z.string(),
      sha: z.string(),
      rootCause: z.string(),
    }),
    handler: async (a) => {
      const diff = await showCommit(a.repo, a.sha);
      const fix = await proposeFix({ diff, rootCause: a.rootCause });
      const check = await applyCheck(a.repo, fix.diff);
      return { ...fix, applies: check.exitCode === 0, applyError: check.stderr || undefined };
    },
  },
];
