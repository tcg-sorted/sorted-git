# Engine core: `core/diff.rs`

Source: `apps/desktop/src-tauri/src/core/diff.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── diff.rs           ← FileDiff w/ hunks+lines, contextLines param (huge = whole-file view),
│                       commit_diff (first-parent, rename detection), commit_files (metadata
│                       only: per-file status + line counts via Patch::line_stats, NO hunk
│                       payload — the Inspector's file list), commit_file_diff (ONE file of a
│                       commit via pathspec incl. oldPath for renames — what DiffPanel opens),
│                       COMPARE TWO COMMITS (issue #55, 2026-11-09): commit_tree_diff
│                       takes an optional base commit whose tree replaces the first
│                       parent's; compare_files(path, base, oid) and
│                       compare_file_diff_with(path, base, oid, …) are the tree-to-tree
│                       `git diff base oid` (no merge base, so it works across branches);
│                       the diff_commit_files / diff_commit_file commands take an optional
│                       `base`, so every older caller is unchanged,
│                       image diffs (base64 — the FRONTEND picks the media type per
│                       extension via core imageMimeFor; issue #51: every non-SVG was
│                       labelled image/png so JPEG/GIF/WebP/BMP/ICO/AVIF painted blank),
│                       staged_patch_text (AI input)
```
