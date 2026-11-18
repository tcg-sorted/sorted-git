# Engine core: `core/submodule.rs`

Source: `apps/desktop/src-tauri/src/core/submodule.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── submodule.rs      ← SUBMODULES FOLLOW THE RECORDED COMMIT (Christian's report 2026-10-21,
│                       see G53): list + update (the sidebar's "Update", init=true) moved
│                       here from misc.rs; synced(path, op) snapshots the submodules whose
│                       checkout equals the parent's index gitlink, runs op, then
│                       follow_recorded updates those whose gitlink moved, skipping one
│                       whose checkout moved meanwhile or that has edited tracked files
│                       (submodule_status Ignore::Untracked); updates are best-effort and
│                       silent (a failure leaves the drift row below). commands.rs wraps
│                       every HEAD-moving command in it (pull, checkout, checkout_detached,
│                       branch_create, merge, merge_abort, rebase + continue/abort,
│                       interactive rebase, cherry-pick(+many), revert, stash apply/pop,
│                       pr_checkout, reset_to only for "hard"); drifted(repo, path) /
│                       commits() feed FileStatus.submodule {recorded, checkedOut} in
│                       repo::status (only for unstaged entries whose delta mode is
│                       Commit); stage::discard_file/discard_all check a drifted
│                       submodule out at its recorded commit (checkout_recorded) instead
│                       of leaving it as a leftover; group pull uses at_recorded_commit +
│                       download_missing + follow_recorded(fetch=false), see G53
```
