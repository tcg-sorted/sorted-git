# Engine core: `core/ai_keys.rs`

Source: `apps/desktop/src-tauri/src/core/ai_keys.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── ai_keys.rs        ← AI provider API keys in the SAME keyring service, account
│                       namespace "ai:<provider>" (no collision with hostnames);
│                       empty set = delete, NoEntry reads as None. Frontend persists
│                       apiKey as '' (settings partialize strips it) and hydrates
│                       from the keyring async; old plaintext localStorage keys are
│                       migrated + scrubbed on first rehydrate
```
