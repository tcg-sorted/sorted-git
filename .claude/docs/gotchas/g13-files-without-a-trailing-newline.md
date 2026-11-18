# G13 — files without a trailing newline

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G13 — files without a trailing newline**: libgit2 diffs contain `\ No newline at end
  of file` marker lines (origins `<`, `>`, `=`) whose content lacks its own `\n`. Any
  hand-built patch text must re-emit those markers (and terminate the unterminated line
  first) or `git apply` fails with "invalid patch instruction". `single_line_patch`
  restores markers from content; staging an addition below the old unterminated last
  line auto-drags in that line's newline-fix pair (like `git add -p`); `pair_partner`
  must NOT treat markers as block boundaries; `file_diff` filters marker rows out of
  UI lines. Regression tests: `*_handle_missing_trailing_newline`.
