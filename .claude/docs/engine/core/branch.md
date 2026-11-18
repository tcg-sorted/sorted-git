# Engine core: `core/branch.rs`

Source: `apps/desktop/src-tauri/src/core/branch.rs` (from §5 Rust engine). [Back to the index](../../../../CLAUDE.md)

```text
├── branch.rs         ← list(+ahead/behind), create/delete/rename, checkout (remote→local:
│                       a missing local is created tracking the remote; an EXISTING local
│                       that is strictly behind the remote is fast-forwarded to it with a
│                       safe checkout_tree BEFORE the ref moves — fast_forward_and_checkout
│                       — and gets the upstream set if it had none; a diverged local is
│                       checked out as-is; owner report 2026-09-07: "checkout origin/x
│                       didn't pull the latest code" was this stale-local case),
│                       merge (ff/normal/conflicts; msg "Merge branch 'x' into y"),
│                       rebase(+continue/abort), cherry-pick, reset soft/mixed/hard,
│                       INTERACTIVE rebase: rebase_commits (first-parent range walk
│                       HEAD→base, newest first, refuses merges + non-ancestors, cap 500)
│                       + rebase_interactive (todo in APPLICATION order: pick/reword/
│                       squash/fixup/drop; builds the chain IN MEMORY via
│                       cherrypick_commit → commit(update_ref None), so a conflict
│                       aborts with AppError::Conflict and the repo is UNTOUCHED —
│                       no pause/continue; only the final reset --hard moves anything;
│                       requires clean tracked tree, keeps authors, committer = sig);
│                       cherry_pick takes record_origin: appends git's
│                       "(cherry picked from commit <oid>)" line like -x, trailer-aware
│                       (no blank line before it when the message already ends in a
│                       trailer block) — byte-for-byte parity with the git CLI is a test;
│                       cherry_pick_many applies oids in the given order (UI passes
│                       oldest-first), stops at the first conflict leaving it as a normal
│                       paused cherry-pick and reports applied/remaining counts
```
