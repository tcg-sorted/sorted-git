# Frontend feature: `features/worktrees/CreateWorktreeDialog`

Source: `apps/desktop/src/features/worktrees/CreateWorktreeDialog` (from §6 Frontend). [Back to the index](../../../../CLAUDE.md)

```text
├── worktrees/CreateWorktreeDialog ← ui dialog kind 'createWorktree' with a
│                               CreateWorktreePreset {branch?, oid?} context: "New
│                               branch" (default; base = preset oid or HEAD) / "Existing
│                               branch" tabs (Select lists locals not held by any
│                               worktree and remotes without a local counterpart),
│                               Folder input pre-filled via core suggestWorktreePath
│                               (settings.worktreeRoot, else the main repo's parent,
│                               + `<repo>-<branch-slug>`) and recomputed as the branch
│                               changes until the user edits it (directoryTouched ref);
│                               Browse picks the PARENT and re-suggests; on success the
│                               chosen parent is remembered, and "Open it in a new tab"
│                               (default on) opens the worktree through useRepo.open so
│                               it becomes a normal repo tab
```
