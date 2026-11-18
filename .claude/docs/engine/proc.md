# Engine: `proc.rs`

Source: `apps/desktop/src-tauri/src/proc.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
proc.rs               ← EVERY child process starts here: proc::hidden(program) adds
                        CREATE_NO_WINDOW on Windows (see G31). A module test scans src/
                        and fails on any bare Command::new outside proc.rs
```
