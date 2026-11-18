# G11 — wrap mode in diffs is NOT virtualized

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G11 — wrap mode in diffs is NOT virtualized** (variable heights); the default no-wrap
  path is. Keep large-file work on the no-wrap path. Guards for huge files (e.g. giant
  SQL data files): diffs over 3000 lines force the virtualized path and disable the wrap
  toggle (`wrapUnavailable` in diffShared); `highlightLine` skips hljs above 5000 chars
  and LRU-caches results; `wordDiff` degrades to whole-line equal segments past
  `WORD_DIFF_MAX_CELLS` (500k LCS cells) — its O(m×n) table on two long INSERT lines
  would otherwise allocate 100MB+ and freeze scrolling.
