# §6.1 Demo mode (why the UI is testable without Rust)

[Back to the index](../../../CLAUDE.md)

`ipc.ts` detects Tauri (`__TAURI_INTERNALS__`). Outside it, every command answers from
`demo.ts` — deterministic synthetic history, status, diffs, conflict sample
(`localStorage.angkorgit-demo-search-delay` = ms slows the demo commit search so an
e2e can click while a search is in flight; `angkorgit-demo-nothing-staged` = 1 moves
every staged demo file to the unstaged side; `angkorgit-demo-submodule-drift` = 1 adds a
drifted `vendor/libfoo` submodule row, cleared by the demo ipc.submoduleUpdate;
`angkorgit-demo-hooks` = pass | fail makes ipc.repoHooks report pre-commit and pre-push, and
`fail` makes ipc.commit/amend throw a pre-commit hook_failed error with lint output and
ipc.push/pushTag a pre-push one with test output, unless noVerify;
`angkorgit-demo-post-hooks` = pass | fail adds post-checkout and post-merge to
ipc.repoHooks, makes the demo ipc.pull fast-forward and ipc.groupUpdate(pull) return a
fast-forward, and with `fail` emits a post-checkout (ipc.checkout) or post-merge
(ipc.pull without noVerify) `hook-warning` through a demo event bus that ipc.listen
subscribes to outside Tauri, and puts a post-merge warning on each group row unless the
run was started with noVerify; `angkorgit-demo-hooks-in-worktree` = 1 makes ipc.repoHooks
report inWorktree (a .husky-style hook folder) so the without-hooks pulls show with no hook;
`angkorgit-demo-discard-fails` = <path> makes the demo ipc.discardFiles report that path as
failed ("Permission denied (os error 13)");
`angkorgit-demo-busy-graph` = 1 builds a 14-lane history so the graph overflows
its column and scrolls sideways; `angkorgit-demo-hooks-delay` = ms stretches every demo commit, with or without hooks, and a demo
push that runs its hook, so an e2e can switch tabs or select a graph commit mid-hook;
`angkorgit-demo-push-rejected` = 1 rejects every non-forced demo branch push as
non_fast_forward; `angkorgit-demo-checkout` = 1 makes the demo ipc.checkout move HEAD
(demo.demoCheckout: demoRepoAt reports the new headBranch and demoBranchList the new
isHead; without the flag checkout stays a no-op and main stays HEAD); the demo push message names the branch it was given — "Pushed main to
origin (demo)" — so the e2e can see that pushes send the branch explicitly). `pnpm dev`
in a browser and the Playwright e2e suite run entirely on this. **Never** import
`@tauri-apps/*` outside `ipc.ts` (dynamic imports inside it only).
