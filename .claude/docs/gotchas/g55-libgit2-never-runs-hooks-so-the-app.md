# G55 — libgit2 never runs hooks, so the app runs them through git hook run

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G55 — libgit2 never runs hooks, so the app runs them through `git hook run`**:
  every commit made in the app used to behave like `git commit --no-verify` (issue #82).
  core/hooks.rs (2026-10-28) covers pre-commit and commit-msg on commit and amend; the
  rules that shaped it: (1) DETECTION mirrors git and is the fast path — no hook, no git
  spawn: `core.hooksPath` (git2 `get_path` expands `~`; a relative value counts from the
  worktree root, the folder git runs hooks in; an empty value reads as unset) else
  `commondir()/hooks` (linked worktrees share the main repo's hooks); the file must have
  exactly the hook's name, so `*.sample` never matches; unix needs an exec bit, Windows only
  existence (or `<name>.exe`): Git for Windows' hook.c find_hook calls access(path, X_OK) and
  its compat/mingw.c mingw_access strips X_OK ("X_OK is not supported by the MSVCRT
  version"), so existence is git's test too; the `#!`-or-`.exe` check in run-command.c's
  is_executable belongs to the PATH lookup, not hook detection (checked against
  git-for-windows/git main, 2026-11-01, after the PR #84 review questioned it). Git 2.54+
  also has hooks defined in config (`hook.<x>.command` + `hook.<x>.event`), so any
  `hook.*.event` equal to the name counts as present too — missing it would be a silent
  --no-verify again. (2) The RUNNER is `git hook run --ignore-missing <name> -- args`
  (Git ≥ 2.36, version parsed from `git --version` incl. the Apple and `.windows.N` forms),
  git located with which_in over ai_cli::search_path (G16) and cached once found, spawned
  through proc::hidden (G31) and ai_cli::spawn_tree + run_tree (both runners) with
  HOOK_TIMEOUT 600 s (git has no
  timeout; without one a stuck hook kept Commit busy until a restart). The hook runs in its
  own process group and a timeout kills the GROUP (killpg; `taskkill /F /T` on Windows):
  killing only git left the hook, e.g. lint-staged, writing the index after the failure was
  reported (PR #84 review; the module test was verified to fail with a child-only kill). After
  the process exits the output readers get at most OUTPUT_DRAIN 1 s instead of an unbounded
  join, so a hook that leaves a background process holding stdout/stderr no longer keeps
  Commit or Push busy (PR #85 reviews; the test waited the background sleep's full 30 s
  before). cwd = worktree root;
  git's local_repo_env variables (GIT_DIR, GIT_INDEX_FILE, GIT_WORK_TREE, …) are REMOVED
  first — an app started from a terminal inside another hook would otherwise aim the hook at
  the wrong repo — then GIT_INDEX_FILE = `<gitdir>/index` and GIT_EDITOR=: are set, as
  `git commit -m` does. Probed on git 2.56: the exit code passes through, the hook's stdout
  arrives on git's STDERR in order, GIT_DIR is not exported for a discovered repo.
  (3) ORDER: the nothing-staged check, then pre-commit, then `index.read(true)` and
  write_tree again — formatter hooks re-stage files, and the index git2 loaded before the
  hook is stale (the restage engine test was verified to fail without the reload); the
  nothing-staged check runs again on the new tree. (3b) HEAD IS PINNED (PR #84 review, P1):
  checkout stays available in the UI while hooks run, and commit/amend used to read HEAD and
  its parents only AFTER the hooks and write through "HEAD", so checking out another branch
  at the same tip during a hook made the commit land on that branch; commit.rs head_state
  records HEAD's symbolic ref, its target and repo.state() before the hooks and
  ensure_head_unchanged refuses to write when any of them moved ("The checked-out branch
  changed while the commit hooks ran, so nothing was written…"); both engine tests failed
  before the guard. (4) commit-msg gets `<gitdir>/
  COMMIT_EDITMSG` (repo.path(), so per worktree like git) holding the message plus a
  newline; unchanged → the original message byte for byte, changed → git's whitespace
  cleanup (trailing spaces per line, leading/trailing blank lines; `#` lines kept as with
  `-m`), emptied → abort. Amend without a new message runs commit-msg on HEAD's message and
  only a changed result replaces it. (4b) AUTHOR ENV (PR #84 review, P2): git commit's
  determine_author_info exports GIT_AUTHOR_NAME/EMAIL/DATE BEFORE pre-commit, so hooks that
  validate the author email failed in the app only; CommitHooks gets the commit's author
  (the configured identity for commit, HEAD's ORIGINAL author for amend) and exports the
  three, the date in git's raw `@<seconds> <±hhmm>` form. git exports no GIT_COMMITTER_*. (5) No git or git < 2.36 → hooks skipped, the commit
  goes through, CommitOutcome.hookWarning names why (maintainer decision: non-blocking).
  (6) PRE-PUSH (PR 2, 2026-10-28): runs from libgit2's push_negotiation callback (push.c:
  filter_refs → calculate_work fills each update's remote oid from the ADVERTISED refs, then
  the callback, then queue_objects + transport->push), so a failing hook sends nothing and
  the stdin has the remote's real SHAs — no ls-remote, which G40 forbids anyway. Rules
  verified against git 2.56 on 2026-10-28 and mirrored by pre_push_input: args = remote
  name + push URL (pushurl, else url; libgit2 applies insteadOf/pushInsteadOf at lookup
  exactly like git, and passes local paths through as configured); one line per ref
  `<local ref> <local sha> <remote ref> <remote sha>`, zeros for a new remote ref,
  `(delete) <zeros>` for a delete, the TAG OBJECT sha for an annotated tag; refs already up
  to date are LEFT OUT, and so is a non-forced non-fast-forward branch update whose remote
  commit exists locally (git rejects it before the hook) while a "fetch first" update
  (remote commit not local) stays in; the hook runs even when nothing needs pushing (empty
  stdin), so push()'s offline up-to-date shortcut runs it too. STDIN NEEDS GIT 2.40:
  `git hook run --to-stdin` is absent from builtin/hook.c at v2.39.0 and present at v2.40.0
  (checked in the git source, 2026-10-28); Apple's Xcode 16 CLT and Debian 12 ship 2.39, so
  on 2.36–2.39 pick_runner runs the hook FILE directly on unix (same env/cwd/PATH,
  proc::hidden, input on stdin; config-defined hooks need 2.54 so none exist there; a hook
  without a shebang fails that spawn with ENOEXEC on Linux and is retried as `/bin/sh <hook>
  <args>` like git's run-command.c — on macOS Rust's posix_spawnp already does that retry, so
  the regression test only fails without the fix on the Linux CI job) and on
  Windows skips it with the warning — direct exec there would mean locating Git for
  Windows' sh.exe, which CI could not exercise. (7) A SLOW PRE-PUSH OUTLIVES THE HTTP
  CONNECTION (maintainer report on #85, 2026-11-03): the hook runs between the info/refs GET
  and the receive-pack POST, and libgit2's own HTTP client reuses the keep-alive connection
  without checking it (curl does, which is why `git push` reconnects), so a hook that ran
  longer than the server's idle timeout (nginx: 75 s) failed the POST with "error receiving
  data from socket: Broken pipe" (class Net). The same dead connection also comes back as
  "unexpected EOF" with class Http when the server only half-closes (FIN, still reading: the
  POST write goes through and the read gets 0 bytes; a full close does it too about one run
  in six, depending on whether the write beats the reset), and on Linux HTTPS as OpenSSL's
  "received early EOF" with class Ssl (maintainer's second report, 2026-11-04). send()
  therefore sends the push ONCE more when the first attempt fails with a Net, Os (WinHTTP's
  class on Windows), Ssh, Http or Ssl error after the hook passed (connection_broke; at most
  one extra attempt, never for a push whose hook did not run), and the retry's negotiation
  skips the hook when every update line is one the hook already approved (already_approved: lines that landed meanwhile drop out, a changed
  remote sha runs the hook again). A `Connection: close` custom header was the other option
  and was NOT taken: it depends on the server honouring it and would break connection-bound
  auth (NTLM) whenever a pre-push hook exists. The two engine tests serve `git http-backend` from
  a small HTTP/1.1 server in tests/git_engine.rs that drops connections idle for 1 s
  (IdleDrop::Close) or shuts down its write side and keeps draining (IdleDrop::HalfClose),
  and give the hook a 3 s sleep; Close failed with the broken pipe before the retry,
  HalfClose with "unexpected EOF" (class 34) before Http joined the list. (8) POST-CHECKOUT,
  POST-MERGE, POST-REWRITE (PR 3, 2026-11-06). Every rule was probed against git 2.56 with
  logging hooks, not read from the docs, because the docs are incomplete: `git restore
  <file>` runs post-checkout `HEAD HEAD 0` exactly like `git checkout -- <file>` (both end
  in checkout.c's checkout_paths; the -p forms return before the hook), so DISCARD runs it;
  deleting an untracked file is `git clean` and runs nothing. Clone and `worktree add` run
  post-checkout `000… <HEAD> 1` (the worktree one in the new worktree), `--no-checkout` and
  an empty repo run nothing. post-merge `0` follows a merge commit or a fast-forward, never
  up to date or conflicts (`1` is only `--squash`, which the app has no form of).
  `git pull --rebase` that can fast-forward MERGES (`--ff-only`) and runs post-merge;
  diverged it runs post-checkout `<orig> <onto> 1` then post-rewrite `rebase` and no
  post-merge — remote::pull already took the same branch (rebase only when ahead AND
  behind). A rebase runs post-checkout RIGHT AFTER it detaches onto, before replaying
  anything (PR #87 review: it ran after the replay, so the hook saw a later HEAD or
  conflict markers; branch::rebase_with_hooks calls hooks.run_now after repo.rebase(),
  which checks onto out), also when it then stops on a conflict, and post-rewrite once when
  it completes, with every pair; `--continue` runs only post-rewrite; abort runs nothing. UP
  TO DATE: when onto is HEAD or an ancestor of HEAD with linear history in between
  (builtin/rebase.c can_fast_forward + is_linear_history), git prints "Current branch is up
  to date" and does nothing, so rebase_with_hooks returns status up_to_date before libgit2
  starts — libgit2 used to re-create those commits with new committer dates (a silent
  --force-rebase) and the app then ran post-checkout and post-rewrite for them (PR #87
  review). The up-to-date shortcut runs AFTER ensure_rebase_can_start (no rebase, merge,
  cherry-pick or revert in progress — repo.state() Clean — and ensure_tracked_clean, the
  interactive rebase's precondition): the first shortcut answered "Already up to date" on
  a dirty tree or mid-rebase, states libgit2's own rebase_init and git reject (PR #87
  review, second round). Both clean checks run ensure_clean: the status without submodules
  plus a comparison of each submodule's HEAD and index gitlinks. An added, deleted or
  changed staged pointer blocks a rebase even under `ignore = all`.
  For worktree changes, repo.submodule_status checks WD_ADDED/DELETED/MODIFIED,
  WD_INDEX_MODIFIED, WD_WD_MODIFIED and WD_UNTRACKED. The ordinary rebase asks with
  SubmoduleIgnore::Untracked, the rule libgit2's own rebase_init check uses, so a submodule
  holding only untracked files passes (round six). The interactive rebase and the reword of
  an older commit (ensure_tracked_clean) ask with SubmoduleIgnore::Unspecified, i.e. each
  submodule's configured `ignore` rule, so `ignore = dirty` in .gitmodules lets an edited
  submodule through (round seven). TRAP: libgit2's repo.statuses() does NOT apply a
  submodule's `ignore = dirty` — it reports WT_MODIFIED where `git status` is clean — so
  the original statuses()-only check never honoured it either; only submodule_status does.
  The replay-time submodule drift failure found while testing this is fixed by #89
  (G59). SKIP HOOKS SURVIVES A PAUSE: a rebase started with hooks skipped
  (Pull without hooks with pull.rebase) writes `<gitdir>/rebase-merge/angkorgit-skip-hooks`
  RIGHT AFTER repo.rebase() initializes, before any replay (aborting the rebase if the write
  fails); rebase_continue_with_hooks reads it before anything else and skips its
  post-rewrite — the toolbar's Continue rebase cannot know the original choice (PR #87
  review, P1). The first fix wrote it only on an index conflict, but replay can also stop
  with an error (an untracked file in the way of a replayed commit) and leave a resumable
  rebase with commits already rewritten (second round). libgit2 and git ignore the extra
  file and delete it with the folder. Seen while testing that, NOT fixed here: after such an
  error, libgit2's next() never wrote the index, so rebase_continue's commit() reports
  Applied and the stopped commit is silently skipped, where `git rebase --continue` re-picks
  it. The fix from main (#88, G58) is retained: stopped_step marks the failed step and
  reapply_stopped_step re-picks it on Continue, after restoring the hook skip choice.
  WARNINGS SURVIVE A FAILED REPLAY:
  post_hooks::rebase and post_hooks::pull return Hooked<AppResult<OpOutcome>> (not
  AppResult<Hooked<…>> like the other wrappers) because their post-checkout runs before the
  replay; finished_or_failed keeps the warnings PostHooks already collected when the
  operation then fails (PostHooks::abandon drops only the not-yet-run hooks), and the two
  commands emit them before returning the error. Hooked::into_result() turns it back into
  AppResult<Hooked<T>> for the engine tests (PR #87 review, third round).
  ORIG_HEAD: git merge writes ORIG_HEAD = HEAD before every merge (builtin/merge.c, even
  when up to date); libgit2 does it in git_merge and git_rebase_init but the app's
  hand-made fast-forwards skipped it, so a post-merge hook running `git diff --name-only
  ORIG_HEAD HEAD` failed in a fresh clone (PR #87 review). branch::set_orig_head writes
  ORIG_HEAD through repo.reference("ORIG_HEAD", …), so libgit2's refdb takes
  `ORIG_HEAD.lock` and fails while another git process holds it instead of overwriting the
  pointer (round six; a plain file write did); branch::merge calls it first and group pull
  calls it inside its locked section before the checkout (not for an up-to-date repo: that
  check runs outside the lock).
  The pairs come from libgit2's `<gitdir>/rebase-merge/rewritten` ("old new" lines,
  appended per commit, kept across a pause), read BEFORE `finish()` deletes the folder;
  git2 0.20 has no onto_id(), onto is the upstream commit. post-rewrite `amend` lists the
  pair even when old == new (git does); `rebase` drops identical pairs and runs only with
  pairs left. Interactive rebase: post-checkout `<orig> <result> 1` and one post-rewrite
  rebase, squash/fixup sources mapped to the combined commit, dropped commits left out.
  git passes `<orig> <onto>` because it checks out onto before replaying; the app builds
  the chain in memory and moves the worktree ONCE, from orig straight to the result, so
  $2 names the commit the worktree was actually checked out to (the same rule as git's
  args: $2 == HEAD when the hook runs) — reporting onto would hand the hook a commit that
  was never checked out (PR #87 review applied the same reasoning to the plain rebase);
  git's sequencer ALSO fires post-rewrite `amend` for each squash/fixup/reword step (an
  in-process `commit --amend`) — deliberately NOT reproduced: the app builds the chain in
  memory and a reword has no intermediate commit to report. Reword is an amend (HEAD) or an
  interactive rebase (earlier commit) and runs those hooks; reword still runs no pre-hook.
  Stash push/apply/pop, reset, cherry-pick, revert, merge/rebase abort and `git fetch b:b`
  (pull_branch on a non-HEAD branch) run nothing. ORDER/STATE: the hooks run after
  submodule::synced, so a hook sees submodules already followed. SKIP HOOKS DIFFERS FROM
  GIT ON PURPOSE: `--no-verify` never skips a post-* hook in git (`commit --amend
  --no-verify` still runs post-rewrite), but the issue's spec and the maintainer want the
  app's Skip hooks to mean "no hooks": the commit box's Skip hooks also skips post-rewrite
  on amend (it now shows when amend is ticked and post-rewrite exists, and drops "like
  --no-verify" from its hint then), the Pull menu has Pull without hooks (shown when
  post-merge, post-rewrite or post-checkout exists), the group menu has Pull all without
  hooks (shown when any repo of the group has post-merge, checked on menu open). Both pull
  items also show when the hooks LIVE IN THE WORKTREE (repo_hooks returns RepoHooks {found,
  inWorktree}; hooks_live_in_worktree): for every hook candidate path (hooks_dir + name),
  visits_worktree walks the path COMPONENT BY COMPONENT LIKE THE OS (a symlinked component
  is replaced by its target plus the rest of the path, `..` pops the PHYSICAL directory
  reached so far — removing `proxy/..` lexically first checked the wrong folder when proxy
  is a link — up to SYMLINK_HOPS 40) and answers yes as soon as ANY visited path lies
  strictly below the workdir and not in the gitdir or commondir. "Below" is decided by FILE
  IDENTITY, not text: `within` opens each existing ancestor with same_file::Handle (a direct
  dependency since PR #87; it was already in Cargo.lock through walkdir) and compares it to
  the workdir's handle, so letter case on case-insensitive disks (C:\Work\Repo vs
  c:/work/repo/.husky), macOS /var vs /private/var and Windows \\?\ prefixes cannot hide a
  match; a symlink is never "the gitdir itself", only its ancestors count for it. A pull can
  only change files in the worktree, so a hook is at risk exactly when locating it passes
  through the worktree: core.hooksPath=.husky (even when `.husky`
  is a tracked link to an empty folder outside — the pull can replace the link with a
  folder holding post-merge), `.git/hooks` linked to `../githooks`, a hook linked to
  `../../scripts/post-merge`, or a chain hook → /tmp/hop → worktree file, dangling or not.
  The backend runs such a hook right after the fast-forward, so the opt-out must show
  before any hook is present (PR #87 review, rounds two to five: canonicalizing the final
  target missed the link-to-outside and the chained cases, lexical `..` missed a link
  followed by `..`, and text prefixes missed a differently-cased path). CONFIG IN THE
  WORKTREE counts too (round six): config_lives_in_worktree starts from commondir/config,
  gitdir/config.worktree and libgit2's global, XDG and system files, opens each with
  git2::Config::open, takes its OWN include.path / includeIf.*.path entries
  (include_depth 0; git2 does not expose libgit2's origin_path, so the walk opens every
  included file itself, relative paths against the including file's folder, `~/` via
  remote::expand_home) and runs visits_worktree on every file. Home expansion
  preserves whitespace in the parsed value, so `.git/project ` and `.git/project`
  can lead to different files. It also resolves `~//src` under the home directory
  because joining the suffix `/src` directly would drop the home prefix.
  On Windows, the include scanner checks `HOME`, then the directory formed by
  concatenating `HOMEDRIVE` and `HOMEPATH`, then `USERPROFILE`. The Windows test
  compares the scanner with Git and libgit2 in a child process with separate
  drive-and-path and profile directories.
  An include such as `[include] path =
  ../project.gitconfig` holding only a comment today can gain core.hooksPath=.husky and a
  .husky/post-merge in one fast-forward. When the walk reaches CONFIG_FILE_LIMIT 64 files
  with more still queued it answers YES (round seven: the stack order visited 64 outside
  includes first and hid the tracked one listed before them) — an unfinished scan must
  keep the opt-out, never hide it. ROUND EIGHT: (a) the bulk "Discard changes in n files…"
  calls ONE command, discard_files(path, files, staged) — one `git restore a b c` runs one
  post-checkout after all files are back; the per-file loop ran the hook n times against a
  half-restored tree. It returns DiscardBatch {leftovers, failed: [{path, message}]}: every
  file is attempted, a file that errors (an untracked file in a folder it may not delete
  from) is recorded instead of aborting the batch, post-checkout runs once if any restore
  happened, and the panel shows "k of n files could not be discarded" with the first
  message and no success toast (round nine; the first version stopped at the first error
  and the UI still said every change was discarded). The header's "Discard all staged
  changes" (discard_staged_all) follows the same rule since round ten: it returned at the
  first file it could not delete, after earlier files were already restored, and so never
  ran post-checkout; it now returns DiscardBatch too, runs the hook once when any file came
  back and the panel names the failed files ("k of n staged files could not be discarded")
  without a success toast.
  stage::discard_staged_all keeps its old Vec<String> signature for
  the engine tests (the first failure becomes its error). E2E TRAP met here:
  `expect(locator).toHaveCount(0)` RETRIES until it holds, so it passes once a wrongly shown
  toast expires (sonner's 4 s) — check absence with a one-shot `locator.count()` after a
  wait, as the hook e2e tests do now. (b) "Pull without hooks" goes through PullCheckDialog like the main
  Pull button when the preview predicts conflicts or blocking edits (pullCheck state
  {noVerify}); the other Pull menu items still never ask. (c) GROUP PULL CONTAINS
  POST-MERGE'S BACKGROUND PROCESSES: the runner waits for the foreground hook and
  hands surviving processes to the group control before draining output, so
  Cancel can enforce the original deadline while a child still holds a pipe open.
  The runner publishes the captured output after the drain and Cancel attaches
  it when building the receipt. An empty process group counts as finished on every
  Unix platform. Linux probes through the group's pidfd when available, otherwise
  Unix uses killpg(pgid, 0): ESRCH means empty, EPERM means still running, and other
  errors mean unknown. Signal 0 never kills anything; a reused pgid only warns.
  Children that leave the group (setsid or daemonizing) are not seen by Cancel,
  matching Git and toolbar Pull. The engine test documents that they can still write.
  Normal Pull all
  completion lets background jobs such as `(npm install &)` continue, matching toolbar
  Pull and Git. On Windows the runner starts Git suspended, assigns it to a job object
  and resumes it. Assigning the job after Git started let fast hooks escape tracking.
  The job handle can close while processes still run. A job setup or resume failure
  reports a hook launch warning on the group row and terminates Git if it was spawned.
  The empty-job regression test drops the reaped child handle, then polls with a
  deadline. Windows job accounting can still report active processes while a
  reference to the exited process remains open; waiting on the child alone does
  not close its handle. See Microsoft's [ActiveProcesses documentation](https://learn.microsoft.com/windows/win32/api/winnt/ns-winnt-jobobject_basic_accounting_information).
  Cancel stops new local writes and polls tracked background hooks while active
  writes and foreground hooks finish. It polls each hook's deadline and termination
  grace period independently, then adds the collected warnings to the final receipt
  once the active operation has recorded its result. After the
  foreground child has been reaped, a numeric process group ID can be reused.
  Linux opens a pidfd for the group leader before reaping it and uses
  `PIDFD_SIGNAL_PROCESS_GROUP` (Linux 6.9+) for polling and signalling. At each
  hook's original deadline Cancel terminates the Windows job or signals the
  group through its pidfd, then gives it one second to exit. If Unix cannot
  acquire a usable group descriptor, Cancel reports uncertainty immediately for
  that hook. On macOS and Linux without usable process-group pidfd support, the
  app can clear the busy state while that hook's background processes still
  write to the repository, even past the original deadline. The foreground timeout
  can still signal its direct child's group while the child is unreaped. Unix
  reports unconfirmed termination after either timeout because a child may have
  left the group. A timed-out foreground child still waiting to exit on Unix is
  reaped in the background. The Cancel receipt carries a warning for background
  processes that reached the deadline. Empty groups, including ones that finish
  before their deadline, cause no cancellation warning. A completed run
  displays its ordinary hook results without these cancellation warnings.
  To reproduce group ID reuse, run the ignored
  `ai_cli::tests::cancellation_does_not_signal_a_reused_process_group` in the
  Rust lib test binary with `unshare --user --map-root-user --pid --fork
  --mount-proc <test-binary> --exact <test-name> --ignored`.
  The dialog waits for this receipt before
  finishing, then applies its results to rows that already returned.
  (d) TIMEOUTS ARE NOT "DID NOT
  RUN": run_watched returns AppError::HookTimeout {hook, seconds, exit_unconfirmed, output} (code
  hook_timeout, detail = output so far); a post-hook timeout becomes a HookWarning with
  status null, timedOut true and the output, shown as "The <hook> hook timed out"
  with the backend message so unconfirmed termination stays visible. The toast
  offers Show output or Show details when there is no output. Status null
  without timedOut still means it never started. An ordinary hook timeout requests
  process-tree termination and waits for Git, then reports that descendant exit
  could not be confirmed. Pre-hook
  timeouts now carry the same message but still have no "without hooks" retry (the item
  the maintainer marked "later" in #85). The toolbar's
  Pull menu asks again on every open (useRepoHooks returns refresh(), called from the
  menu's onOpenChange): the watcher ignores .git/config, so a core.hooksPath changed in a
  terminal left the cached answer stale; the group menu already checks on open. Demo:
  `angkorgit-demo-hooks-in-worktree` = 1.
  Checkout, merge, rebase, discard, clone and worktree have no skip UI (git has no switch
  either); the engine wrappers all take no_verify for the tests. Tauri's
  blocking_post_hooks admits one hook-capable command at a time per worktree path
  but rebase_abort can interrupt a rebase's post-checkout hook. After the hook
  returns, rebase_with_hooks checks that rebase-merge still exists before replaying
  a commit; an already aborted rebase returns "Rebase aborted" without replay or
  post-rewrite. The integration test holds the hook while another thread aborts it.
  blocking_post_hooks also installs a scoped observer on its blocking thread. The observer emits
  hook progress for both the initiating worktree and a reserved target worktree.
  worktree_add reserves the canonical future target before creating it (resolve
  the nearest existing ancestor first), retains that guard through post-checkout,
  and releases it on success or failure. A checkout opened through the new folder
  or a symlink alias returns operation_running until the hook finishes. The unit
  test holds the real hook while checking that canonical target lock and its release.
  The observer emits
  `post-hook-progress` when a post-hook runs and when it finishes.
  HookWarningHost shows and dismisses the loading toast for that hook and worktree.
  A second operation returns operation_running with the hook name and repository
  folder; components/actionError.ts toastActionError displays it as toast.info,
  leaving the progress toast visible. Other failures keep their existing error
  messages, including the toolbar's separate headline and multiline details.
  The demo emits the same typed response. The e2e checks the info toast and uses a
  one-shot count for the absent red error, before it could expire.
  It also listens for `hook-warning`
  and shows toast.warning(message, "Nothing was undone in <repo>.", action Show output →
  HookWarningDialog, the HookFailedDialog layout without a retry button, data-hook-warning=
  <hook>) 600 ms later (AFTER_OPERATION_TOAST_MS): the event arrives before the command's
  response, and without the delay the caller's "Checkout x done" toast stacked on top of it;
  a missing/old git reads "The <hook> hook did not run". GROUP PULL (#69, approved by the
  maintainer in #82 on 2026-11-01): post-merge runs in group_update_inner INSIDE the same
  with_active_result section as the fast-forward, after follow_recorded, and its warnings
  ride on GroupUpdateResult.hookWarnings (serialized only when non-empty), so the receipt
  Cancel returns includes them; the fast-forward and its hook are one unit — Cancel before
  it means neither. Cancel during the hook waits for it like any active local write
  while monitoring earlier background hooks. The skip choice is per run:
  repository_group_start(runId, noVerify) → GroupUpdateControl::skipping_hooks. The dialog
  shows the warning and a collapsed "Hook output" on the row (data-group-hook-warning), "n
  hook warnings" in the counts line, and "Pull all without hooks" in the title. The clone
  test lives in its own binary (tests/clone_hooks.rs): a fresh clone only has hooks from a
  GLOBAL core.hooksPath, because libgit2's clone ignores init.templateDir (git clone copies
  template hooks — a known gap), and HOME/GIT_CONFIG_GLOBAL must be set before libgit2
  initializes, which would leak into the parallel tests of git_engine.rs. NOT covered yet,
  by scope: prepare-commit-msg, post-commit (trivial for commit/amend now that warnings have
  a path; git also runs it for merge, cherry-pick, revert and rebase commits), pre-merge-
  commit, pre-rebase, the submodules' own post-checkout (`git submodule update` runs it,
  the app's follow and Update submodule do not), template hooks on clone, hooks for commits
  made by pull/merge, revert, cherry-pick and rebase, live output and cancel.
