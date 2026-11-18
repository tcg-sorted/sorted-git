# Engine core: `core/pull_preview.rs`

Source: `apps/desktop/src-tauri/src/core/pull_preview.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── pull_preview.rs   ← KNOW BEFORE YOU PULL (owner pick 2026-10-22): pull_preview(path, remote)
│                       → Option<PullPreview {source, ahead, behind, rebase, conflicts,
│                       localChanges}>; None on a detached HEAD or when remote::pull_source
│                       finds nothing (same source rule as pull, now pub(super), and
│                       pull_rebase_configured likewise). behind == 0 returns early.
│                       localChanges = status paths (untracked dirs matched by prefix) ∩
│                       every path changed between the merge base and the incoming tip,
│                       i.e. the files git refuses to overwrite ("Your local changes … would be
│                       overwritten"). conflicts only when ahead > 0: merge mode =
│                       repo.merge_commits (index in memory, writes nothing); rebase mode
│                       = an IN-MEMORY rebase (RebaseOptions::inmemory) that stops at the
│                       first conflicting commit and aborts; it does write the replayed
│                       commit objects as loose objects, harmless and ignored by the
│                       watcher; a merge-clean but rebase-conflicting history is a test.
│                       Conflict lists are cached per (path, local oid, incoming oid,
│                       rebase) in a 64-entry map, so the status-refresh re-runs only redo
│                       the cheap local-edit half. Measured on a copy of this repo
│                       (401 commits, 1 ahead / 3 behind): 48 ms first, ~8 ms after; both
│                       predictions matched `git pull` exactly. Frontend: useRepo
│                       .pullPreview, loaded by loadPullPreview at the end of refresh AND
│                       refreshStatus (previewSeq guard, G26) for pickRemote's remote;
│                       Toolbar shows an AlertTriangle (text-danger, data-pull-warning
│                       local|conflicts) after the behind Badge, a red second line in the
│                       Hint (pullWarningText), and the MAIN Pull button opens
│                       components/PullCheckDialog instead of pulling. Conflicts: "This
│                       pull will conflict", file list, Cancel / Pull and resolve; local
│                       edits win over conflicts: "Your changes are in the way", Cancel /
│                       Stash n files… → openDialog('createStash', {paths}). The Pull
│                       menu items (merge/rebase/other remote) never ask: an explicit
│                       choice. Demo: localStorage angkorgit-demo-pull-preview =
│                       conflicts|local (also sets status.behind 3)
```
