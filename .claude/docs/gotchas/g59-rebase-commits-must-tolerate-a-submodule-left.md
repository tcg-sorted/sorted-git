# G59 — rebase commits must tolerate a submodule left at its previous commit

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G59 — rebase commits must tolerate a submodule left at its previous commit**
  (issue #89, 2026-11-13): libgit2 1.9.6's rebase_commit_merge calls
  rebase_ensure_not_dirty(false, true), whose index-to-workdir diff hard-codes
  SubmoduleIgnore::Untracked. After onto changes a gitlink, the submodule folder
  still points at the old commit and every replay commit fails with GIT_EUNMERGED
  "unstaged changes exist in workdir". Configuring ignore = all cannot override it,
  and the app's submodule::synced runs only after an Ok outcome, too late to help.
  branch::commit_rebase_step wraps all three replay commit sites (initial rebase,
  Continue's current step and its remaining loop). It tries plain rebase.commit
  first; only an Unmerged error in the Rebase class activates the workaround.
  Submodule enumeration/status failures then preserve that original commit error
  rather than introducing optional inspection failures. Successful ordinary
  commits never inspect submodules. For initialized submodules with
  commit drift but no staged or unstaged tracked edits inside, it copies the index
  into a pathless in-memory Index, preserving entry IDs, modes, stages and flags,
  and adds IndexEntryFlag::VALID only to their stage-zero gitlinks. The repository
  handle uses that index only during rebase.commit; RebaseCommitIndex restores the
  original index on scope exit, including errors. libgit2's diff honours VALID;
  ordinary files and dirty submodules still undergo its normal worktree checks.
  The temporary index cannot write to disk, and no config, checkout or real index
  flags are changed. Keep libgit2's own commit path: it preserves authors/messages,
  Applied handling, detached HEAD/reflog updates and the rewritten mapping used by
  notes and post-rewrite. Do not hold the temporary index across next(), finish(),
  hooks or #88's reapply_stopped_step; they must see the original repository index.
  Raw engine rebase/pull/continue leave the submodule folder where it was; app
  wrappers use submodule::synced_rebase for rebase, pull and Continue. It keeps
  eligible (name, checked-out OID) baselines in the per-worktree rebase-merge/
  angkorgit-submodules JSON file while a rebase is paused, also after an error.
  Saves use a tempfile in that same directory, write_all + sync_all, then atomic
  persist/replace (including on Windows); partial writes never truncate the live
  baseline and failed saves clean up their temporary file. Save failures are
  logged and never replace the operation's Ok/conflicts/error result, including
  #88's blocker message. Baseline recovery is auxiliary; missing-submodule
  enumeration while inferring a legacy baseline is best-effort too.
  Successful outcomes apply G53's safe follow rule before post-rewrite runs and
  refresh the saved baseline to the resulting checkout; conflict outcomes are Ok
  and follow too. Continue combines currently in-sync submodules with saved
  baselines only where the checkout still matches. A submodule deliberately moved
  after a pause is excluded, even when moved back to its original commit. For an
  older-client rebase with no baseline file, the original rebase HEAD tree supplies
  the baseline: only clean checkouts still at those gitlinks follow the completed
  rebase's recorded commits. Without this fallback, the raw engine finished but
  the app left stale gitlinks that Stage all could inadvertently roll back (G53).
  Malformed baseline data is an error, never a reason to guess original eligibility.
  The file is deleted with rebase state on finish/abort. Failed Continue attempts
  leave checkouts untouched and preserve the baseline for retry after edits clear.
  Integration coverage includes explicit/configured pull, multiple replay commits,
  legacy recovery, normal-file and gitlink conflicts, Continue/abort, already-applied
  steps, #88's blocked replay, untracked submodule files, edited/staged submodule
  files, HEAD.lock failure, unchanged disk index on failure, no leaked flags, app
  synchronization, post-hook arguments/mappings and skipped hooks across a pause.
  Recovery tests use the app wrapper, require the followed checkout before the
  rewrite hook, verify Stage all has no gitlink rollback, and cover retry after
  failure, deliberately moved legacy checkouts and app-started blocked replay.
  Atomic-publish tests check the old snapshot stays readable during a partial
  write and after a simulated disk-full error. Integration tests force snapshot
  publication failure after conflicts and a #88 stop, and replay plain-file
  commits with an intermediate malformed .gitmodules that a later commit repairs.
