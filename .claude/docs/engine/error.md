# Engine: `error.rs`

Source: `apps/desktop/src-tauri/src/error.rs` (from §5 Rust engine). [Back to the index](../../../CLAUDE.md)

```text
error.rs              ← AppError → serialized {code, message}; codes: conflict/auth/not_found/…;
                        NotFastForward keeps code non_fast_forward and message() returns a
                        next-step sentence (Pull with rebase / force push) instead of
                        libgit2's "cannot push non-fastforwardable reference" (issue #40)
```
