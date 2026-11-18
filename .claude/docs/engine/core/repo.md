# Engine core: `core/repo.rs`

Source: `apps/desktop/src-tauri/src/core/repo.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── repo.rs           ← open/discover/init/info/status (discover refuses a path that does not
│                       exist — libgit2 would otherwise walk up and open the parent repo),
│                       upstream divergence, get/set config,
│                       ref_fingerprint (state + HEAD + every ref name:target, sorted — the
│                       watcher's cheap did-refs-change probe; no peeling, no ahead/behind)
```
