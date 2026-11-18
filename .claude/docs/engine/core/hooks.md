# Engine core: `core/hooks.rs`

Source: `apps/desktop/src-tauri/src/core/hooks.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── hooks.rs          ← GIT HOOKS (issue #82; PR 1 #84: pre-commit + commit-msg on commit and
│                       amend; PR 2: pre-push), see G55: hooks_dir (core.hooksPath via
│                       get_path, relative → worktree root, else commondir/hooks),
│                       present(repo, name) (exact name, exec bit on unix, existence + .exe on
│                       Windows, or a config-defined hook.<x>.event = name), run(repo, runner,
│                       name, args, env, input) — the GENERIC runner the post-hooks reuse:
│                       Runner::Git = `git hook run --ignore-missing [--to-stdin=<temp file>]
│                       <name> -- args`, Runner::Direct = the hook file itself with input on
│                       stdin (only for input on Git 2.36–2.39, unix only — pick_runner; an
│                       ENOEXEC spawn, a hook without a shebang, is retried as `/bin/sh <hook>
│                       <args>` with the same env/cwd/stdin, git's run-command fallback), both
│                       through proc::hidden + ai_cli::spawn_tree/run_tree
│                       (HOOK_TIMEOUT 600 s; the hook runs in its own process group on unix and
│                       a timeout kills the whole group with killpg, `taskkill /F /T` on
│                       Windows — killing only git left lint-staged writing the index after
│                       the failure was reported, PR #84 review), cwd = worktree root, PATH =
│                       search_path, git's local_repo_env vars removed,
│                       failure → AppError::Hook (code hook_failed, payload detail = output
│                       tail capped at 64 KiB); CommitHooks::prepare(repo, author,
│                       no_verify)/pre_commit/commit_msg is the commit flow and exports
│                       GIT_AUTHOR_NAME/EMAIL/DATE (git_date: `@<seconds> <±hhmm>`) like git
│                       commit; PrePush::prepare(repo, remote, no_verify)/run(repo, refs) is
│                       the push flow (args = remote name + pushurl-or-url, stdin =
│                       pre_push_input); PR 3 (post-*): PostHook {Checkout{previous, new,
│                       branch}, Merge, Rewrite{Amend|Rebase, pairs}} carries git's args and
│                       stdin (PostHook::merged(outcome) for ok/fast_forward, ::rebased(pairs)
│                       drops old == new and is None when nothing is left) and run_post(repo,
│                       hooks, no_verify) → Vec<HookWarning> runs each present one through the
│                       same runner (post-rewrite takes the stdin path, so 2.40+ or Direct),
│                       a non-zero exit, a launch error or a missing git is a WARNING, never an
│                       Err; PostHooks is the collector the engine's *_with_hooks functions
│                       take: run_now (a hook git runs mid-operation, e.g. post-checkout right
│                       after a rebase checks out onto), later (after the operation and
│                       submodule::synced), skip/skipped (a user's Skip hooks, remembered by a
│                       paused rebase), off() for the plain engine functions, which run none;
│                       repo_hooks(path) lists pre-commit/commit-msg/pre-push and the three
│                       post hooks for the UI; 11 module tests
```
