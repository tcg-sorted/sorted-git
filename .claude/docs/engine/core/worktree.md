# Engine core: `core/worktree.rs`

Source: `apps/desktop/src-tauri/src/core/worktree.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── worktree.rs       ← linked worktrees over libgit2's worktree API: list (main first,
│                       then every registered worktree; is_current compares CANONICAL
│                       paths, is_missing when the folder is gone, is_dirty is None for
│                       the current one — the UI already holds its status), add
│                       (existing local branch, remote → local tracking branch, or a new
│                       branch from a base rev; refuses a branch checked out anywhere
│                       else with a message naming that folder; worktree NAME is a
│                       sanitized, de-duplicated basename of the target folder), remove
│                       (refuses dirty/locked unless force; prune with working_tree so
│                       the folder goes too), prune (only entries whose folder is gone),
│                       checked_out_elsewhere (branch::checkout_branch guard — libgit2
│                       happily checks out a branch another worktree holds; git CLI
│                       refuses), fingerprint_parts (worktree name/path/HEAD folded into
│                       repo::ref_fingerprint so add/remove/checkout in a sibling
│                       worktree trigger a full refresh; see G34)
```
