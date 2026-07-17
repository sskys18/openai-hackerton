# Culprit

**Find the commit that broke it - and why - without leaving your Codex session.**

Culprit is a [Codex](https://openai.com/codex) plugin (an MCP server) that turns a
failing test or bug report into a root-caused fix. It:

1. **Reproduces** the failure so it's working from evidence, not a hunch.
2. **Bisects** your git history with `git bisect run` to prove the exact offending commit.
3. **Explains** the root cause by feeding the culprit diff + failure log to **GPT-5.6**.
4. **Proposes** a minimal fix as a validated unified diff (never auto-applied).

The deterministic bisect keeps the LLM honest: the culprit commit is *proven* by a
reproducible predicate, and GPT-5.6 only reasons about a diff we already trust.

> Built for **OpenAI Build Week** - Track: **Developer Tools**.

---

## Status

Pre-build scaffolding. The MCP server, tools, and demo fixture are stubbed with
their contracts defined in [`PLAN.md`](./PLAN.md). Implementation milestones M1-M5
are tracked there. This README documents the intended setup/usage so judges (and
future-me) can run it once the core lands.

## Requirements

- [Bun](https://bun.sh) >= 1.3 (or Node >= 20)
- `git` >= 2.30 (for `git bisect run`)
- An OpenAI API key with access to GPT-5.6

## Setup

```bash
bun install
cp .env.example .env   # then paste your OPENAI_API_KEY
```

## Register as a Codex MCP server

Add to your Codex config (`~/.codex/config.toml`):

```toml
[mcp_servers.culprit]
command = "bun"
args = ["run", "/absolute/path/to/culprit/src/server.ts"]
env = { OPENAI_API_KEY = "sk-...", CULPRIT_MODEL = "gpt-5.6" }
```

Then in a Codex session:

> "The test `bun test user.test.ts` is failing on main but passed last week.
> Use culprit to find what broke it and propose a fix."

Codex will call the `find_regression`, `explain_commit`, and `propose_fix` tools.

## Tools exposed

| Tool | What it does |
| --- | --- |
| `reproduce_failure` | Runs the failing command, captures exit code + output. |
| `find_regression` | Drives `git bisect run` between a good and bad ref, returns the culprit SHA. |
| `explain_commit` | GPT-5.6 root-cause report from the culprit diff + failure log. |
| `propose_fix` | GPT-5.6 minimal unified-diff fix, validated with `git apply --check`. |

## Safety

Culprit never rewrites history, commits, or pushes. It runs a local `git bisect`
and **always** resets back to your original `HEAD`, refuses to run on a dirty
working tree by default, caps bisect steps, and times out runaway commands. Fixes
are proposals - applying them is a separate, human-approved step.

## How Codex + GPT-5.6 were used

See [`SUBMISSION.md`](./SUBMISSION.md) for the judged write-up. Short version:
Codex scaffolded and iterated the MCP server and bisect driver; GPT-5.6 powers the
`explain_commit` and `propose_fix` reasoning at runtime. Codex `/feedback` session
ID for the core build is recorded in `SUBMISSION.md`.

## License

MIT
