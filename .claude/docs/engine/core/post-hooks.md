# Engine core: `core/post_hooks.rs`

Source: `apps/desktop/src-tauri/src/core/post_hooks.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── post_hooks.rs     ← THE LIST OF OPERATIONS THAT RUN A POST-* HOOK (issue #82 PR 3), see G55
│                       (8): one wrapper per command — checkout_branch/checkout_detached/
│                       branch_create(checkout)/checkout_remote_ref snapshot HEAD around
│                       submodule::synced(op) (so the hook sees the final state, submodules
│                       included) → post-checkout <old> <new> 1; merge runs post-merge from the
│                       outcome; pull/pull_branch/rebase/rebase_continue/rebase_interactive/
│                       amend/reword hand a PostHooks collector to the engine's *_with_hooks
│                       functions and finish it after synced (pull and pull_branch decide
│                       merge vs rebase vs ref-only move inside the engine); discard_file (tracked, not a drifted submodule)/discard_all
│                       (only with tracked unstaged changes)/discard_staged_file/
│                       discard_staged_all (only with staged entries)/stash_restore_files →
│                       post-checkout HEAD HEAD 0 like `git restore`; clone and worktree_add →
│                       post-checkout 000… <HEAD> 1 in the new repo (none while HEAD is
│                       unborn). Each returns Hooked<T> {value, warnings}; commands.rs
│                       report() emits one `hook-warning` event per warning (HookWarningEvent
│                       {repoPath, hook, status, message, output}) and returns the value, so
│                       no command changed its return type. The plain engine functions
│                       (branch::rebase, remote::pull, commit::amend…) keep their signatures
│                       and run no post-hook — the engine tests call them hundreds of times
```
