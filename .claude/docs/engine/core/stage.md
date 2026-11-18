# Engine core: `core/stage.rs`

Source: `apps/desktop/src-tauri/src/core/stage.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── stage.rs          ← stage/unstage file+all, HUNK ops (patch-text split + apply), LINE ops
│                       (single_line_patch fwd/reverse; discard is PAIR-aware — reverting a
│                       modified line restores the original); stage_hunk/unstage_hunk go
│                       through isolated_hunk_patch, which REWRITES the @@ header so the
│                       new-file start equals the old-file start (see G45), discard_file/all → report leftovers
│                       (UNSTAGED side: checkout_index, index untouched);
│                       discard_staged_file/all (owner request 2026-09-07: discard must not
│                       be an unstaged-only affordance) → discard_staged (PR #91, the
│                       maintainer's smaller shape after a 3,700-line journal/recovery version
│                       was declined): IndexLock takes <gitdir>/index.lock with create_new
│                       BEFORE any file moves (held by another process → nothing changes,
│                       the error names the lock), copies the index into it and opens it as a
│                       private git2::Index — never repo.index(): checkout_tree re-reads the
│                       repo-owned index and would drop in-memory edits; per file a
│                       checkout_tree of HEAD with update_index(false) +
│                       disable_pathspec_match (a pathspec turned `[ab].txt` into a pattern
│                       that also reset a.txt) then remove_path + add of the HEAD entry (zero
│                       stat, so git and libgit2 re-hash on the next status), or delete +
│                       remove_path for a path HEAD lacks; removals run before restores so a
│                       file that replaced a folder is gone before the folder comes back; a
│                       failing file stays as it was and lands in DiscardBatch.failed; the
│                       index is written ONCE (index.write() into index.lock.lock → renamed
│                       to index.lock, then index.lock → index); selecting either name of a
│                       staged rename (renames_head_to_index) discards both; no journal, no
│                       recovery on open
```
