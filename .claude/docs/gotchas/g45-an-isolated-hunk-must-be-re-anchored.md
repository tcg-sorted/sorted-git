# G45 — an isolated hunk must be re-anchored before git_apply

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G45 — an isolated hunk must be re-anchored before `git_apply`**: split_patch
  keeps each `@@ -a,b +c,d @@` header from the FULL diff, so a later hunk's `+c`
  includes the line shift of the earlier hunks — libgit2's apply starts its search
  at `c` and, unlike `git apply`, does not hunt for the preimage elsewhere, so
  "hunk at line N did not apply" for every hunk after the first (issue #22: Stage
  hunk and Unstage hunk both hit it). isolated_hunk_patch rebuilds the header with
  `+a` (the index side is the old side for both the forward stage diff and the
  reversed unstage diff), keeping `+c` only when the old side is empty. This is what
  single_line_patch already did for line ops. Regression test:
  `stage_and_unstage_a_later_hunk_in_a_multi_hunk_file`.
