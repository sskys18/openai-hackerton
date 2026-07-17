// Tool registry: schema + handler for each MCP tool. Handlers are stubbed until
// milestones M2/M3 land (see PLAN.md). Schemas are final so the server lists a
// stable tool surface that Codex can bind to today.

import { z } from "zod";

export interface ToolDef {
  name: string;
  description: string;
  input: z.ZodTypeAny;
  handler: (args: unknown) => Promise<unknown>;
}

const notImplemented = (name: string) => async () => {
  throw new Error(`tool "${name}" is stubbed; implementation pending (see PLAN.md)`);
};

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
    handler: notImplemented("reproduce_failure"),
  },
  {
    name: "find_regression",
    description:
      "Drive `git bisect run` between a known-good ref and a bad ref to find the exact commit that introduced a regression.",
    input: z.object({
      repo: z.string(),
      cmd: z.string().describe("Predicate: exits 0 when good, non-zero when broken."),
      goodRef: z.string().describe("A ref/sha where the command passed."),
      badRef: z.string().optional().describe("Defaults to HEAD."),
      maxSteps: z.number().int().positive().optional(),
    }),
    handler: notImplemented("find_regression"),
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
    handler: notImplemented("explain_commit"),
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
    handler: notImplemented("propose_fix"),
  },
];
