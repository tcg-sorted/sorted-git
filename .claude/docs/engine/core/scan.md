# Engine core: `core/scan.rs`

Source: `apps/desktop/src-tauri/src/core/scan.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── scan.rs           ← FOLDER SCAN for the welcome page (2026-10-03): scan(root, max_depth)
│                       → RepositoryScan {repositories [{path, name, isWorktree}],
│                       truncated}; breadth-first over EVERY folder, SCAN_MAX_DEPTH 16
│                       is only a runaway guard, never follows symlinks, skips
│                       '.'-prefixed folders and SKIPPED_DIRS (node_modules, target,
│                       vendor, dist, build, obj, venv, Pods, Library…), and DOES
│                       descend into found repos so submodules and nested repos are
│                       listed — the first version stopped at depth 4 and at the first
│                       repo, and found 32 of the 231 repos in the owner's work folder
│                       (198 sat five levels down); a full walk of that folder (~41k
│                       folders) takes about half a second, and the count was verified
│                       against `find -name .git` (identical lists); a folder only
│                       counts when `.git` exists AND Repository::open succeeds (an
│                       empty `.git` dir is ignored — never use discover here, it would
│                       walk up to a parent repo); the path comes from repo::root_path,
│                       the SAME string discover returns, so a scanned repo opened later
│                       never duplicates its recent entry; SCAN_MAX_RESULTS 2000 →
│                       truncated; sorted case-insensitively
```
