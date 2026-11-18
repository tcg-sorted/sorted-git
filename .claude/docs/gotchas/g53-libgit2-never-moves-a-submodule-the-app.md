# G53 — libgit2 never moves a submodule; the app does, but only an in-sync one

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G53 — libgit2 never moves a submodule; the app does, but only an in-sync one**:
  checkout_tree/merge/rebase/reset only rewrite the gitlink in the parent's index, so
  after a pull that bumps a submodule pointer the submodule stays on the old commit
  and the parent reports it modified (plain `git pull` without `submodule.recurse`
  does the same; git status says "new commits"). Christian hit it in QontrolPanel on
  2026-10-21: the reflog showed our "fast-forward merge origin/main" and a manual
  Update ten seconds later, and committing everything would have reverted the bump.
  The rule (core/submodule.rs): snapshot submodules whose checked-out HEAD equals the
  index gitlink BEFORE the op, update only those whose gitlink changed and whose HEAD
  is still the old one, and skip any with edited tracked files — a submodule the user
  moved on purpose is never touched. The update is libgit2 git_submodule_update:
  SAFE checkout + set_head_detached (like `git submodule update`), fetching the
  submodule's origin only when the commit is missing. Soft/mixed resets are not
  wrapped (they leave the working tree alone, so must the submodule). GROUP PULL keeps
  its cancel guarantee: the snapshot is taken before the parent fetch,
  download_missing runs Remote::download (objects only, NO ref writes, transfer/
  sideband callbacks return !is_cancelled) for in-sync submodules whose target-tree
  gitlink is missing locally, then control.ensure_active(), and inside
  with_active_result after set_target follow_recorded runs with allow_fetch(false) —
  local writes only under the lock. NOTE git2's SubmoduleUpdateOptions::fetch() sets
  allow_fetch = true, so allow_fetch must be called AFTER it. Engine tests build a
  real submodule through `git submodule add` with `-c protocol.file.allow=always`
  (git ≥ 2.38.1 blocks the file transport for submodules otherwise); the group test
  was verified to fail with download_missing removed. Not built: initializing
  submodules after clone, fetching submodules on the tab-switch auto fetch, an Update
  button in the DiffPanel header.
