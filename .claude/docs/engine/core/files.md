# Engine core: `core/files.rs`

Source: `apps/desktop/src-tauri/src/core/files.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── files.rs          ← FILE BROWSING for the Inspector's ALL FILES view (user request
│                       2026-09-22, GitKraken's "View all files"): tree_files(path, oid) →
│                       every blob/submodule path of the commit's tree (PreOrder walk, no
│                       diff), index_files(path) → stage-0 index paths (the working copy's
│                       tracked set; the frontend unions it with the status list so
│                       untracked and deleted files still appear), file_contents(path,
│                       file, oid?) → FileDiff status "unchanged": ONE hunk of context lines
│                       (old = new line numbers) with an EMPTY header — flattenDiff and
│                       DiffViewer's HunkHeader skip empty headers, so the panel shows the
│                       file without a meaningless @@ row —, NUL-probe binary detection
│                       (first 8000 bytes), images as base64 new_image, 10 MB cap, a path
│                       missing from the commit errors "is not part of commit <short>"
```
