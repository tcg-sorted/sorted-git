# G24 — never resolve a branch name with resolve_reference_from_short_name alone

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G24 — never resolve a branch name with `resolve_reference_from_short_name`
  alone**: libgit2's dwim follows gitrevisions precedence, where **tags shadow
  branches** (`refs/tags/x` before `refs/heads/x`). Real repos routinely carry
  deployment tags named `demo`/`production` next to the branches — merge then
  reported "Already up to date" (tag commit was an ancestor) and the graph's
  branch filter showed the tag's stale history, i.e. "merge doesn't work but
  GitKraken is fine". `branch::resolve_branch_ref` tries `refs/heads/<name>`,
  then `refs/remotes/<name>`, then falls back to dwim (kept so filtering by tag
  still works) — use it for every branch-name lookup (merge, rebase, history
  filter use it today). Related: the fast-forward merge path must use SAFE
  checkout (checkout_tree before set_target) — it originally force-checked-out
  and silently destroyed uncommitted changes. Regression tests:
  `*_prefers_branch_over_same_named_tag`, `merge_fast_forward_preserves_uncommitted_changes`.
