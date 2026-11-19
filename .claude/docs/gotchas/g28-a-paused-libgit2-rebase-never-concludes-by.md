# G28 — a paused libgit2 rebase never concludes by committing

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G28 — a paused libgit2 rebase never concludes by committing**: when
  `branch::rebase` pauses on conflicts, resolving the files and committing by
  hand leaves `.git/rebase-merge` behind, so `repo.state()` reports "rebase"
  forever (the original bug: rebase → resolve → merge → red badge stuck).
  `commit()` cleans up MERGE state but not rebase. The toolbar state badge
  (Toolbar.tsx `StateActions`) is therefore an ACTION menu: continue rebase
  (rebase_continue), abort rebase (rewinds — destructive confirm), abort
  merge, and "clear state, keep everything as is" (`repo::cleanup_state` →
  libgit2 `git_repository_state_cleanup`, which removes state markers without
  touching HEAD/worktree). Never auto-clear state; a paused rebase may be
  genuinely in progress. Regression test:
  `cleanup_state_clears_a_stale_rebase_without_touching_files`.
