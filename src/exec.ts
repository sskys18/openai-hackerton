// Sandboxed command runner: run a command in a repo dir with a timeout,
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
 * Spawn an argv array (no shell) inside `cwd`. Never throws on non-zero exit;
 * the caller inspects `exitCode`. Kills the process on timeout and reports it.
 */
export async function spawn(argv: string[], opts: ExecOptions): Promise<ExecResult> {
  const timeoutMs = (opts.timeoutSec ?? DEFAULT_TIMEOUT_SEC) * 1000;
  let timedOut = false;

  const proc = Bun.spawn(argv, {
    cwd: opts.cwd,
    env: opts.env ? { ...process.env, ...opts.env } : process.env,
    stdout: "pipe",
    stderr: "pipe",
  });

  const timer = setTimeout(() => {
    timedOut = true;
    proc.kill(9);
  }, timeoutMs);

  try {
    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    const exitCode = await proc.exited;
    return { exitCode, stdout, stderr, timedOut };
  } finally {
    clearTimeout(timer);
  }
}

/** Run a shell command string via `sh -c` inside `cwd`. */
export function run(cmd: string, opts: ExecOptions): Promise<ExecResult> {
  return spawn(["sh", "-c", cmd], opts);
}
