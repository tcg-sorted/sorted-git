# G37 — neither libgit2 nor git stash push -- <paths> gives a truthful partial stash

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G37 — neither libgit2 nor `git stash push -- <paths>` gives a truthful partial
  stash**: libgit2's `git_stash_save_with_opts` + paths resets the WHOLE working
  tree (verified: stashing only `a.txt` reverted the dirty `b.txt`, silent data
  loss) and git2 0.20.4's `StashSaveOptions` has no `message` setter. The git CLI
  was tried next and is wrong differently: with other files STAGED, `git stash
  push -- a.txt` builds the stash tree from the whole index, so the stash shows
  b.txt too and popping it re-applies b.txt (owner report 2026-09-07, reproduced
  with `git diff --name-status stash@{0}^ stash@{0}`). misc.rs::stash_paths
  therefore assembles the three stash trees itself (see the misc.rs entry).
  Regression tests: `stash_selected_files_leaves_the_rest_in_place`,
  `stash_selected_untracked_file_only`,
  `stash_selected_staged_file_leaves_other_staged_files_alone` (also asserts
  `git stash list` sees the hand-built stash and the message reads "On master:
  only a"), `stash_selected_new_staged_file_is_removed_and_restored` (`git stash
  show --name-only` lists exactly that file). Do not move it back to either
  primitive without re-running those.
