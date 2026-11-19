# Frontend (`apps/desktop/src/`)

[Back to the index](../../../CLAUDE.md). The docs for `features/<name>/` live in
`features/<name>.md`; everything outside `features/` is grouped below. State conventions
and the no-comments rule are in CLAUDE.md.

## Outside `features/`

| Area | Doc |
| --- | --- |
| App entry, splash, IPC boundary and demo data | [app-entry.md](app-entry.md) |
| Shared components (tabs, toolbar, palette, status bar, dialogs…) | [components.md](components.md) |
| Shared hooks and helpers (shortcuts, selection, highlighting) | [shared.md](shared.md) |
| Demo mode (§6.1): the browser/e2e fallback for every IPC command and its localStorage flags | [demo-mode.md](demo-mode.md) |

## `features/`

| Feature | Doc | What it covers |
| --- | --- | --- |
| `repository` | [features/repository.md](features/repository.md) | store (repo/status/branches/tags/stashes/remotes/submodules/ |
| `graph` | [features/graph.md](features/graph.md) | KEYBOARD FLOW (owner/user feedback 2026-09-07): ↑/↓/Home/End |
| `commit` | [features/commit.md](features/commit.md) | COMMIT HOOKS (issue #82, 2026-10-28, G55): features/repository/ |
| `diff` | [features/diff.md](features/diff.md) | ACTIVE CHANGE MARKER (issue #75, 2026-10-13): ChangeBlock |
| `conflicts/ConflictResolver` | [features/conflicts.md](features/conflicts.md) | 2026-09-10 REWORK (users found it hard to use): ONE row |
| `forge` | [features/forge.md](features/forge.md) | store.ts (per-repo forge state with a SESSION CACHE: |
| `worktrees/CreateWorktreeDialog` | [features/worktrees.md](features/worktrees.md) | ui dialog kind 'createWorktree' with a |
| `sidebar/Sidebar.tsx` | [features/sidebar.md](features/sidebar.md) | SECTION HEADERS = GOLD ICON TILE + COUNT BADGE (user |
| `blame/BlameView.tsx` | [features/blame.md](features/blame.md) | the BLAME PANE of FileHistoryPanel (owner 2026-09-12, after a |
| `history/FileHistoryPanel` | [features/file-history.md](features/file-history.md) | EMPTY STATES are SettingEmpty cards (icon tile + title + |
| `history/undoStore.ts` | [features/undo.md](features/undo.md) | undo/redo: tracked() records before/after HEAD snapshots |
| `inspector` | [features/inspector.md](features/inspector.md) | COMPARE (issue #55, 2026-11-09, the owner's own spec in the |
| `terminal/TerminalPanel` | [features/terminal.md](features/terminal.md) | xterm.js ↔ PTY events; FONTS (issue #28, 2026-09-20, then widened to |
| `settings` | [features/settings.md](features/settings.md) | store (theme, accent, zoom, reduceMotion, interface/code/terminal |
| `ai/client.ts` | [features/ai.md](features/ai.md) | binds settings AI config + Rust HTTP/CLI transports to |
| `ui/store.ts` | [features/ui-store.md](features/ui-store.md) | layout state (sidebar/terminal/palette/dialogs/centerDiff/ |
