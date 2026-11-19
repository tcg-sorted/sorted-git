# Engine: `commands.rs`

Source: `apps/desktop/src-tauri/src/commands.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
commands.rs           ← THIN Tauri command layer; every git op via blocking() → spawn_blocking
                        (incl. paths_exist(paths) → Vec<bool> is_dir, used by the welcome page
                        to flag recents whose folder is gone). HOOKED_OPERATIONS maps the
                        operation's canonical path to its running hook; the observer updates
                        that lock key even when clone/worktree hooks run in another folder.
                        worktree_add also reserves its future canonical target and keeps that
                        guard through post-checkout; both lock keys receive hook progress.
                        A blocked command returns Busy (operation_running, hook + folder name).
```
