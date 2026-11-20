# Rust engine (`apps/desktop/src-tauri/src/`)

[Back to the index](../../../CLAUDE.md). One file per source module: the docs for
`src/<module>.rs` live in `<module>.md`, for `src/core/<module>.rs` in `core/<module>.md`.
The engine conventions are in CLAUDE.md; the credential chain is in
[credential-chain.md](credential-chain.md).

## App-level modules

| Module | Doc | What it covers |
| --- | --- | --- |
| `main.rs / lib.rs` | [main-lib.md](main-lib.md) | builder: plugins(dialog, opener), setup sets accounts::CONFIG_DIR |
| `commands.rs` | [commands.md](commands.md) | THIN Tauri command layer; every git op via blocking() → spawn_blocking |
| `error.rs` | [error.md](error.md) | AppError → serialized {code, message}; codes: conflict/auth/not_found/… |
| `state.rs` | [state.md](state.md) | recent repositories JSON (app config dir); RECENT_LIMIT 1000 (was 30 |
| `terminal.rs` | [terminal.md](terminal.md) | real PTY per session (portable-pty), events term-data-{id}/term-exit-{id} |
| `watcher.rs` | [watcher.md](watcher.md) | notify-debouncer-mini (400ms) → "repo-changed" event |
| `http.rs` | [http.md](http.md) | AI/HTTP proxy (reqwest, rustls) — keeps CORS + keys out of webview |
| `forge.rs` | [forge.md](forge.md) | forge API proxy: forge_request(repoPath, host, request) looks up the |
| `proc.rs` | [proc.md](proc.md) | EVERY child process starts here: proc::hidden(program) adds |
| `account_check.rs` | [account-check.md](account-check.md) | re-verifies a stored account token against its provider (GitHub /user |
| `cli.rs` | [cli.md](cli.md) | `sorted-git` CLI (GitHub Desktop-shaped): bare / `open [path]` |
| `fonts.rs` | [fonts.md](fonts.md) | INSTALLED FONT LIST (issue #28, 2026-09-20): fonts_list() → |
| `editors.rs` | [editors.md](editors.md) | OPEN IN EXTERNAL EDITOR (issue #18, 2026-09-12): a static |
| `ai_cli.rs` | [ai-cli.md](ai-cli.md) | installed AI-CLI transport: detect (which_in over augmented PATH + |

## `core/` (the git engine proper)

| Module | Doc | What it covers |
| --- | --- | --- |
| `core/types.rs` | [core/types.md](core/types.md) | serde structs mirroring @angkorgit/core (camelCase rename_all) |
| `core/repo.rs` | [core/repo.md](core/repo.md) | open/discover/init/info/status (discover refuses a path that does not |
| `core/history.rs` | [core/history.md](core/history.md) | revwalk pagination + search/author/branch filters (list still |
| `core/stage.rs` | [core/stage.md](core/stage.md) | stage/unstage file+all, HUNK ops (patch-text split + apply), LINE ops |
| `core/commit.rs` | [core/commit.md](core/commit.md) | commit + amend run the pre-commit and commit-msg hooks first (hooks.rs |
| `core/sign.rs` | [core/sign.md](core/sign.md) | config-driven commit signing, zero in-app setup: reads |
| `core/hooks.rs` | [core/hooks.md](core/hooks.md) | GIT HOOKS (issue #82; PR 1 #84: pre-commit + commit-msg on commit and |
| `core/post_hooks.rs` | [core/post-hooks.md](core/post-hooks.md) | THE LIST OF OPERATIONS THAT RUN A POST-* HOOK (issue #82 PR 3), see G55 |
| `core/branch.rs` | [core/branch.md](core/branch.md) | list(+ahead/behind), create/delete/rename, checkout (remote→local: |
| `core/remote.rs` | [core/remote.md](core/remote.md) | credential chain (see below), add/edit/remove/list remotes (add refuses a |
| `core/accounts.rs` | [core/accounts.md](core/accounts.md) | app-managed hosting accounts, MULTIPLE per host keyed by |
| `core/ai_keys.rs` | [core/ai-keys.md](core/ai-keys.md) | AI provider API keys in the SAME keyring service, account |
| `core/misc.rs` | [core/misc.md](core/misc.md) | stash (list/create/apply/pop/drop), tags; stash_create |
| `core/worktree.rs` | [core/worktree.md](core/worktree.md) | linked worktrees over libgit2's worktree API: list (main first |
| `core/blame.rs` | [core/blame.md](core/blame.md) | BLAME (2026-09-12, backlog item 4 shipped): blame_file(path, file |
| `core/diff.rs` | [core/diff.md](core/diff.md) | FileDiff w/ hunks+lines, contextLines param (huge = whole-file view) |
| `core/files.rs` | [core/files.md](core/files.md) | FILE BROWSING for the Inspector's ALL FILES view (user request |
| `core/submodule.rs` | [core/submodule.md](core/submodule.md) | SUBMODULES FOLLOW THE RECORDED COMMIT (Christian's report 2026-10-21 |
| `core/pull_preview.rs` | [core/pull-preview.md](core/pull-preview.md) | KNOW BEFORE YOU PULL (owner pick 2026-10-22): pull_preview(path, remote) |
| `core/scan.rs` | [core/scan.md](core/scan.md) | FOLDER SCAN for the welcome page (2026-10-03): scan(root, max_depth) |
| `core/conflict.rs` | [core/conflict.md](core/conflict.md) | conflict list/read/resolve (write + index.add_path) |
