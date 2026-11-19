# Engine: `watcher.rs`

Source: `apps/desktop/src-tauri/src/watcher.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
watcher.rs            ← notify-debouncer-mini (400ms) → "repo-changed" event;
                        filters .git noise, keeps HEAD/index/refs/packed-refs, skips *.lock;
                        the SLOT is generation- and path-aware (Slot<T>: begin(path) → token,
                        install(token) only while the token is current, stop(path) only for
                        the path being watched): watch_repo and watch_stop each run on
                        spawn_blocking, so a slow recursive watch of the PREVIOUS tab (a repo
                        with a big node_modules takes thousands of inotify watches) used to
                        finish after the next tab's watch and overwrite it, and a late
                        watch_stop could clear the new one — the tab then never refreshed on
                        file changes; watch_stop takes the repo path for that reason
```
