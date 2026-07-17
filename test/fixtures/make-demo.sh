#!/usr/bin/env bash
# Generate a small demo repo with a regression planted mid-history, so Culprit
# (and `git bisect run`) has something real to find. Reproducible + throwaway.
#
#   ./test/fixtures/make-demo.sh            # creates test/fixtures/regression-demo
#   ./test/fixtures/make-demo.sh /tmp/demo  # or a custom dir
#
# The predicate: `node test.mjs` exits 0 when good, 1 when broken.
# Commit 6 ("perf: tighten loop bound") introduces an off-by-one that drops the
# last term of sumTo(n). Commits before it pass; commit 6 and after fail.

set -euo pipefail

DIR="${1:-$(cd "$(dirname "$0")" && pwd)/regression-demo}"
rm -rf "$DIR"
mkdir -p "$DIR"
cd "$DIR"

git init -q
git config user.email "demo@culprit.dev"
git config user.name "Culprit Demo"
export GIT_AUTHOR_DATE GIT_COMMITTER_DATE

commit() { # $1 = message, $2 = day offset
  local d="2026-07-0$2T12:00:00"
  GIT_AUTHOR_DATE="$d" GIT_COMMITTER_DATE="$d" git add -A
  GIT_AUTHOR_DATE="$d" GIT_COMMITTER_DATE="$d" git commit -q -m "$1"
}

# --- test harness: same across all commits ---
cat > test.mjs <<'EOF'
import { sumTo } from "./sum.mjs";
const cases = [[1, 1], [3, 6], [5, 15], [10, 55]];
let ok = true;
for (const [n, want] of cases) {
  const got = sumTo(n);
  if (got !== want) { console.error(`sumTo(${n}) = ${got}, want ${want}`); ok = false; }
}
if (!ok) process.exit(1);
console.log("all good");
EOF

# c1: initial working implementation
cat > sum.mjs <<'EOF'
// sumTo(n) = 1 + 2 + ... + n
export function sumTo(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) total += i;
  return total;
}
EOF
commit "feat: add sumTo" 1

# c2..c5: unrelated churn (README + comments), still passing
echo "# demo" > README.md; commit "docs: add readme" 2
echo "export const VERSION = '1.0.0';" > version.mjs; commit "chore: add version" 3
printf '\n## Usage\n\nimport { sumTo }\n' >> README.md; commit "docs: tweak readme" 4
echo "// pure, no side effects" >> sum.mjs; commit "docs: annotate sum" 5

# c6: THE REGRESSION - off-by-one, drops the final term
cat > sum.mjs <<'EOF'
// sumTo(n) = 1 + 2 + ... + n
export function sumTo(n) {
  let total = 0;
  for (let i = 1; i < n; i++) total += i; // BUG: should be i <= n
  return total;
}
// pure, no side effects
EOF
commit "perf: tighten loop bound" 6

# c7..c10: more churn on top of the broken state
echo "export const AUTHOR = 'demo';" > author.mjs; commit "chore: add author" 7
echo "" >> README.md; commit "docs: whitespace" 8
echo "export const YEAR = 2026;" >> version.mjs; commit "chore: bump meta" 9
echo "// TODO: add more cases" >> test.mjs; commit "test: note followups" 10

echo "Demo repo ready at: $DIR"
echo "  good ref (passes): \$(git rev-parse HEAD~9)   # c1"
echo "  bad  ref (fails):  HEAD                        # c10"
echo "  predicate:         node test.mjs"
echo "  planted culprit:   the 'perf: tighten loop bound' commit"
