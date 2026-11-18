# Engine: `state.rs`

Source: `apps/desktop/src-tauri/src/state.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
state.rs              ← recent repositories JSON (app config dir); RECENT_LIMIT 1000 (was 30
                        until the folder scan, 2026-10-03; 200 was too few for the
                        owner's 231-repo work folder); prepend_recents is the one
                        list rule (new paths on top in the given order, existing entries
                        with the same path removed, cap) shared by recent_add and
                        recent_add_many (skips paths that are not directories,
                        dedupes); 1 module test
```
