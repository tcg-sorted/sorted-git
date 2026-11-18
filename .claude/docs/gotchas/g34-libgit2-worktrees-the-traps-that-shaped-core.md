# G34 — libgit2 worktrees: the traps that shaped core/worktree.rs

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G34 — libgit2 worktrees: the traps that shaped `core/worktree.rs`**: (1) a
  linked worktree's `repo.path()` is `<main>/.git/worktrees/<name>` and its
  `commondir()` is the main `.git` — open the MAIN repo via
  `Repository::open(commondir)` before listing/adding/removing, and never trust
  `repo.path()` to be `<workdir>/.git`. (2) `git_worktree_add` creates the target
  folder with `mkdir EXCL` and does NOT create parents, so the engine pre-creates
  the parent and turns "folder exists" into a plain message. (3) libgit2 does
  NOT stop a checkout of a branch another worktree has checked out (git CLI does);
  `branch::checkout_branch` runs `worktree::checked_out_elsewhere` first, and
  `worktree::add` does the same before touching disk. (4) `Worktree::prune` needs
  `valid(true)` to remove a VALID worktree and `working_tree(true)` to delete
  the folder — without the flag only the `.git/worktrees/<name>` entry goes and
  the folder stays as an orphan; pass `working_tree` only when the folder still
  exists (rmdir on a missing path errors). (5) A missing worktree cannot be
  opened, so its branch is read from `.git/worktrees/<name>/HEAD` by hand. (6)
  The watcher watches the WORKDIR recursively, so a linked worktree never saw
  its own index/HEAD (they live under the main `.git`) — `watcher.rs` now watches
  the extra gitdir roots and filters them with the same metadata rules, and
  `worktrees/*/HEAD|gitdir` under the main `.git` count as relevant so the main
  tab notices a sibling worktree's checkout; `ref_fingerprint` folds worktree
  name/path/HEAD in so that change becomes a FULL refresh (the worktree list is
  loaded by `refresh`, not `refreshStatus`). (7) macOS temp paths differ from
  their canonical form (`/var` vs `/private/var`), so `is_current` compares
  canonicalized paths — tests compare canonicalized `main_path` for the same
  reason. Frontend invariant: a worktree opened in the app is just another repo
  tab (same store, watcher, terminal session, drafts keyed by its own path), and
  `RepositoryInfo.isWorktree/mainPath` is the only thing that tells it apart.
