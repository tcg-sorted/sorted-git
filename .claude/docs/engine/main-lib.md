# Engine: `main.rs / lib.rs`

Source: `apps/desktop/src-tauri/src/lib.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
main.rs / lib.rs      ← builder: plugins(dialog, opener), setup sets accounts::CONFIG_DIR,
                        manage(TerminalState, WatcherState), ~69 command registrations,
                        pub mod test_api (flat re-exports for integration tests);
                        compact_wayland_titlebar (Linux only, best-effort, see G48)
```
