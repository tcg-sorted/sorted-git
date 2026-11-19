# Engine core: `core/commit.rs`

Source: `apps/desktop/src-tauri/src/core/commit.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── commit.rs         ← commit + amend run the pre-commit and commit-msg hooks first (hooks.rs,
│                       G55; no_verify skips them) and return CommitOutcome {oid, hookWarning};
│                       commit (merge-aware parents; refuses "Nothing staged to commit" when the
│                       index tree equals HEAD's, or HEAD is unborn and the index empty, except
│                       during a merge — the UI guards ⌘⏎ the same way), amend, revert (mainline 1 for merges),
│                       reword(oid, message) — EDIT A COMMIT MESSAGE IN PLACE (user request via
│                       the owner 2026-09-20, GitKraken-style): HEAD → message-only amend that
│                       keeps HEAD's TREE (never the index — the commit box's amend folds staged
│                       changes in, this one must not; signed via sign::create_commit with the
│                       original author + committer), works on a dirty tree; an earlier commit →
│                       branch::rebase_interactive from the commit's first parent with that
│                       entry as `reword` and the rest `pick`, so it inherits the clean-tree
│                       guard and the in-memory-or-untouched conflict rule, and returns the NEW
│                       oid of the reworded commit (walks index first-parents back from the new
│                       HEAD) so the UI can re-select it
```
