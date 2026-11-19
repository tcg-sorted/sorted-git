# Engine core: `core/blame.rs`

Source: `apps/desktop/src-tauri/src/core/blame.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── blame.rs          ← BLAME (2026-09-12, backlog item 4 shipped): blame_file(path, file,
│                       rev) → FileBlame {path, rev (resolved oid or None), lines, hunks
│                       [{oid, short_oid, summary, author_name/email, time, start_line,
│                       line_count, committed}]}; rev None blames the WORKING COPY:
│                       git2 blame_file for the committed part then blame_buffer over
│                       the workdir bytes so uncommitted lines come back with a zero
│                       oid (committed=false, author "Not committed yet", summary
│                       "Uncommitted changes"); rev Some accepts any revspec ("<oid>^"
│                       is how the UI walks back) and reads the blob from that tree;
│                       refuses binaries (NUL byte) and files over 5 MB; author +
│                       summary come from repo.find_commit(oid) ONCE per oid
│                       (CommitAuthor) — NEVER hunk.final_signature(), see G44;
│                       hunks sorted by start line; a working-copy blame of a path
│                       HEAD does not have errors "has no committed history yet"
│                       and a path missing from the requested commit names that
│                       commit (issue #21 follow-up; the UI disables Blame for
│                       such files via core hasCommittedHistory — WorkingCopyPanel
│                       menu label "Blame (no commits yet)", DiffPanel button
│                       disabled with a Hint)
```
