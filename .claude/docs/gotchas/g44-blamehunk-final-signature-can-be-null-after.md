# G44 — BlameHunk::final_signature() can be NULL after blame_buffer

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G44 — `BlameHunk::final_signature()` can be NULL after `blame_buffer`**: libgit2
  splits a committed hunk around an uncommitted edit and the split halves keep a
  non-zero `final_commit_id` but NO signature; git2 0.20's `final_signature()`
  dereferences it and raises a NON-UNWINDING panic, so the whole app aborted the
  first time anyone blamed a tracked file with WIP edits (issue #21, one day after
  blame shipped in 0.13.0; the existing test appended a line, which never splits).
  blame.rs reads author/email/time from `repo.find_commit(oid).author()` instead,
  cached per oid next to the summary. Regression test:
  `blame_of_an_uncommitted_edit_inside_a_committed_block_keeps_the_author`.
