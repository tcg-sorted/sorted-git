# G58 — a rebase step that fails without a conflict is NOT applied, whatever libgit2 says next

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G58 — a rebase step that fails without a conflict is NOT applied, whatever libgit2
  says next** (issue #88 by ChrisLauinger77, 2026-11-09): `git_rebase_next` advances
  `msgnum`/`current` first and writes the merged index LAST (merge_trees →
  git_merge__check_result → checkout_index → indexwriter commit), so an untracked file
  in the way ("1 uncommitted change would be overwritten by merge", class Merge) left the
  step current but never checked out. `rebase.commit()` on Continue then saw index ==
  HEAD, returned GIT_EAPPLIED, and the loop treated the commit as already applied: it
  vanished, and a later commit that depended on it emptied and vanished too.
  branch.rs stopped_step() now handles every `next()` error in rebase() and
  rebase_continue(): it writes `rebase-merge/angkorgit-stopped-step` (git and libgit2
  ignore unknown files there and delete them with the folder) and, when files the
  commit touches are dirty or untracked, replaces libgit2's text with "The rebase
  stopped at <short> "<summary>" because <paths> is in the way…".
  reapply_stopped_step() runs first in rebase_continue when the mark exists:
  cherrypick_commit(step, HEAD) in memory, SAFE checkout_index (allow_conflicts +
  merge style when it conflicts, so markers and conflict entries look like a normal
  pause), then the repo index is rebuilt entry by entry from the merged index
  (Index::add keeps each entry's stage) and the mark removed; a checkout that is still
  blocked returns the same message with the mark kept, nothing moved. Without the mark
  Continue is unchanged, so a conflict resolved to HEAD's content still skips the
  empty commit. Pull with rebase goes through branch::rebase and is covered. PR #87
  rewrites the same two functions: the change is two call sites plus helpers so its
  rebase stays mechanical.
