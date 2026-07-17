// Sandboxed command runner: run a shell command in a repo dir with a timeout,
// capturing stdout/stderr/exit code. Used by reproduce_failure and the bisect
// predicate. Deterministic, no LLM.

export interface ExecResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export interface ExecOptions {
  cwd: string;
  timeoutSec?: number;
  env?: Record<string, string>;
}

const DEFAULT_TIMEOUT_SEC = Number(process.env.CULPRIT_CMD_TIMEOUT ?? 300);

/**
 * Run `cmd` via `sh -c` inside `cwd`. Never throws on non-zero exit; the caller
 * inspects `exitCode`. Kills the process group on timeout.
 *
 * TODO(M1): implement with Bun.spawn, wire AbortSignal.timeout, capture streams.
 */
export async function run(cmd: string, opts: ExecOptions): Promise<ExecResult> {
  void cmd;
  void opts;
  void DEFAULT_TIMEOUT_SEC;
  throw new Error("not implemented: exec.run (M1)");
}
