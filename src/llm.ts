// GPT-5.6 client + prompt builders for the reasoning steps (explain_commit,
// propose_fix). Deterministic git work stays out of here on purpose.

import OpenAI from "openai";

const MODEL = process.env.CULPRIT_MODEL ?? "gpt-5.6";

let client: OpenAI | null = null;
export function openai(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
    client = new OpenAI({ apiKey });
  }
  return client;
}

export interface RootCause {
  summary: string;
  rootCause: string;
  riskyHunks: string[];
}

export interface FixProposal {
  diff: string;
  rationale: string;
  testSuggestion: string;
}

/**
 * Feed the culprit diff + failure log to GPT-5.6, return a structured root-cause
 * report. TODO(M3): responses API call with JSON schema + safe parse.
 */
export async function explainCommit(input: {
  diff: string;
  failureLog: string;
}): Promise<RootCause> {
  void input;
  void MODEL;
  throw new Error("not implemented: llm.explainCommit (M3)");
}

/**
 * Ask GPT-5.6 for a minimal unified-diff fix given the root cause. The caller
 * validates it with git.applyCheck before returning to Codex. TODO(M3).
 */
export async function proposeFix(input: {
  diff: string;
  rootCause: string;
}): Promise<FixProposal> {
  void input;
  throw new Error("not implemented: llm.proposeFix (M3)");
}
