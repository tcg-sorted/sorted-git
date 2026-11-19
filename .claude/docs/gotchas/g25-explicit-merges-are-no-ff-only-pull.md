# G25 — explicit merges are no-ff; only pull fast-forwards by default

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G25 — explicit merges are no-ff; only pull fast-forwards by default**: in
  merge-flow teams (feature→staging→demo→production) the target often already
  contains the source, so git's default fast-forward moves the pointer and
  leaves NO merge commit — users read the empty graph as "merge didn't work"
  (verified via a user repo's reflog: `fast-forward merge production` followed
  by their manual reset + a GitKraken no-ff redo). `branch::merge` takes
  `no_ff`; drag-merge and both "Merge into current" menus pass `true`, the drop
  dialog's "Fast-forward if possible" and `remote.rs` pull paths pass `false`.
  Issue #20 (2026-09-12, a fork owner wanting GitHub's "Sync fork" result) asked
  for GitKraken's second option, so both menus ALSO carry "Fast-forward current
  to this" (sidebar) / "Fast-forward current branch to this" (graph chip): it
  passes `no_ff = false` and is DISABLED unless `merge_can_ff(HEAD, source)` is
  true — the menu effect asks the engine on open (branchMenuFf / refMenuFf,
  null while loading, `cancelled` flag against a stale answer) and the item is
  never hidden. Demo mode answers from commit indices (demoCanFastForward:
  source newer than target), so with `main` at the tip every demo entry is
  disabled and the e2e asserts that state; the engine tests cover the true
  case. The no-ff default itself is unchanged.
  Regression test: `merge_no_ff_creates_merge_commit_when_fast_forward_possible`.
